interface AnchorData {
  anchorSelector: string;
  anchorOffset: number;
  anchorLength: number;
  anchorText: string;
  anchorContextBefore: string;
  anchorContextAfter: string;
}

interface AnchorHighlight extends AnchorData {
  commentId: number;
}

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_idle",
  main() {
    let floatingBtn: HTMLButtonElement | null = null;
    let currentAnchorData: AnchorData | null = null;

    function buildSelector(el: Element): string {
      const parts: string[] = [];
      let current: Element | null = el;
      while (
        current &&
        current !== document.body &&
        current !== document.documentElement
      ) {
        let selector = current.tagName.toLowerCase();
        if (current.id) {
          selector += "#" + CSS.escape(current.id);
          parts.unshift(selector);
          break;
        }
        const parent = current.parentElement;
        if (parent) {
          const siblings = Array.from(parent.children).filter(
            (c) => c.tagName === current!.tagName
          );
          if (siblings.length > 1) {
            const index = siblings.indexOf(current) + 1;
            selector += `:nth-of-type(${index})`;
          }
        }
        parts.unshift(selector);
        current = parent;
      }
      return parts.join(" > ");
    }

    function removeFloatingBtn() {
      if (floatingBtn) {
        floatingBtn.remove();
        floatingBtn = null;
      }
      currentAnchorData = null;
    }

    function showFloatingButton(x: number, y: number) {
      removeFloatingBtn();

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.toString().trim())
        return;

      const selectedText = selection.toString().trim().slice(0, 500);
      if (!selectedText) return;

      const range = selection.getRangeAt(0);
      const container = range.startContainer.parentElement;
      if (!container) return;

      const containerText = container.textContent || "";
      const selStart = containerText.indexOf(selectedText);
      const offset = selStart >= 0 ? selStart : range.startOffset;

      const contextBefore = containerText
        .slice(Math.max(0, offset - 30), offset)
        .trim();
      const contextAfter = containerText
        .slice(
          offset + selectedText.length,
          offset + selectedText.length + 30
        )
        .trim();

      currentAnchorData = {
        anchorSelector: buildSelector(container),
        anchorOffset: offset,
        anchorLength: selectedText.length,
        anchorText: selectedText,
        anchorContextBefore: contextBefore,
        anchorContextAfter: contextAfter,
      };

      floatingBtn = document.createElement("button");
      floatingBtn.textContent = "Comment on this";
      floatingBtn.style.cssText = `
        position: fixed;
        z-index: 2147483647;
        background: #1a1a2e;
        color: #e2e8f0;
        border: 1px solid #374151;
        border-radius: 8px;
        padding: 6px 14px;
        font-size: 13px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        transition: background 0.15s;
        left: ${Math.min(x, window.innerWidth - 160)}px;
        top: ${Math.min(y + 10, window.innerHeight - 40)}px;
      `;

      floatingBtn.addEventListener("mouseenter", () => {
        if (floatingBtn) floatingBtn.style.background = "#2d2d44";
      });
      floatingBtn.addEventListener("mouseleave", () => {
        if (floatingBtn) floatingBtn.style.background = "#1a1a2e";
      });

      floatingBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentAnchorData) {
          chrome.runtime.sendMessage({
            type: "ANCHOR_DATA",
            data: currentAnchorData,
          });
        }
        removeFloatingBtn();
      });

      document.body.appendChild(floatingBtn);
    }

    document.addEventListener("mouseup", (e) => {
      if (floatingBtn && floatingBtn.contains(e.target as Node)) return;

      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed && selection.toString().trim()) {
          showFloatingButton(e.clientX, e.clientY);
        } else {
          removeFloatingBtn();
        }
      }, 10);
    });

    document.addEventListener("mousedown", (e) => {
      if (floatingBtn && !floatingBtn.contains(e.target as Node)) {
        removeFloatingBtn();
      }
    });

    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === "HIGHLIGHT_ANCHORS") {
        highlightAnchors(message.anchors || []);
      }
    });

    function highlightAnchors(anchors: AnchorHighlight[]) {
      document
        .querySelectorAll("mark[data-communities-comment]")
        .forEach((el) => {
          const parent = el.parentNode;
          if (parent) {
            parent.replaceChild(
              document.createTextNode(el.textContent || ""),
              el
            );
            parent.normalize();
          }
        });

      for (const anchor of anchors) {
        try {
          const container = document.querySelector(anchor.anchorSelector);
          if (!container) continue;

          const textContent = container.textContent || "";
          const searchText = anchor.anchorText;

          let matchIndex = textContent.indexOf(searchText);

          if (matchIndex === -1 && anchor.anchorContextBefore) {
            const ctxIdx = textContent.indexOf(anchor.anchorContextBefore);
            if (ctxIdx >= 0) {
              matchIndex = ctxIdx + anchor.anchorContextBefore.length;
            }
          }

          if (matchIndex === -1) continue;

          highlightTextInNode(
            container,
            matchIndex,
            searchText.length,
            anchor.commentId
          );
        } catch {
          // Silently fail for individual anchors
        }
      }
    }

    function highlightTextInNode(
      container: Element,
      startOffset: number,
      length: number,
      commentId: number
    ) {
      const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT
      );

      let currentOffset = 0;
      let node: Node | null;

      while ((node = walker.nextNode())) {
        const nodeLen = (node.textContent || "").length;

        if (currentOffset + nodeLen > startOffset) {
          const localStart = startOffset - currentOffset;
          const localEnd = Math.min(localStart + length, nodeLen);

          const range = document.createRange();
          range.setStart(node, localStart);
          range.setEnd(node, localEnd);

          const mark = document.createElement("mark");
          mark.setAttribute("data-communities-comment", String(commentId));
          mark.style.cssText =
            "background: rgba(234, 179, 8, 0.25); border-bottom: 2px solid #eab308; cursor: pointer; padding: 1px 0;";

          mark.addEventListener("click", () => {
            chrome.runtime.sendMessage({
              type: "SCROLL_TO_COMMENT",
              commentId,
            });
          });

          range.surroundContents(mark);
          return;
        }

        currentOffset += nodeLen;
      }
    }
  },
});
