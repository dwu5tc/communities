const API_BASE = "http://localhost:3000";
const DISPLAY_NAME = "user_1";

interface CommentData {
  id: number;
  postId: number;
  parentId: number | null;
  displayName: string;
  body: string;
  anchorSelector: string | null;
  anchorOffset: number | null;
  anchorLength: number | null;
  anchorText: string | null;
  anchorContextBefore: string | null;
  anchorContextAfter: string | null;
  createdAt: string;
}

interface AnchorData {
  anchorSelector: string;
  anchorOffset: number;
  anchorLength: number;
  anchorText: string;
  anchorContextBefore: string;
  anchorContextAfter: string;
}

interface PostData {
  id: number;
}

let currentPost: PostData | null = null;
let currentTab = "page";
let currentAnchor: AnchorData | null = null;
let allComments: CommentData[] = [];
let replyingTo: number | null = null;

// DOM elements
const loading = document.getElementById("loading")!;
const errorEl = document.getElementById("error")!;
const mainContent = document.getElementById("main-content")!;
const pageTitle = document.getElementById("page-title")!;
const commentsContainer = document.getElementById("comments-container")!;
const commentBody = document.getElementById("comment-body") as HTMLInputElement;
const submitBtn = document.getElementById("submit-btn") as HTMLButtonElement;
const commentForm = document.getElementById("comment-form") as HTMLFormElement;
const anchorPreview = document.getElementById("anchor-preview")!;
const anchorTextEl = document.getElementById("anchor-text")!;
const clearAnchorBtn = document.getElementById("clear-anchor")!;
const pageCountEl = document.getElementById("page-count")!;
const discussionCountEl = document.getElementById("discussion-count")!;

// Tab switching
document.querySelectorAll<HTMLButtonElement>(".tab").forEach((tabBtn) => {
  tabBtn.addEventListener("click", () => {
    currentTab = tabBtn.dataset.tab!;
    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.remove("active"));
    tabBtn.classList.add("active");
    renderComments();
  });
});

// Clear anchor
clearAnchorBtn.addEventListener("click", () => {
  currentAnchor = null;
  anchorPreview.hidden = true;
});

// Listen for anchor data from content script
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "ANCHOR_DATA") {
    currentAnchor = message.data;
    anchorTextEl.textContent = message.data.anchorText;
    anchorPreview.hidden = false;
    commentBody.focus();

    // Switch to page comments tab
    currentTab = "page";
    document.querySelectorAll<HTMLButtonElement>(".tab").forEach((t) => {
      t.classList.toggle("active", t.dataset.tab === "page");
    });
    renderComments();
  }

  if (message.type === "SCROLL_TO_COMMENT") {
    const commentEl = document.querySelector(
      `[data-comment-id="${message.commentId}"]`
    ) as HTMLElement | null;
    if (commentEl) {
      commentEl.scrollIntoView({ behavior: "smooth", block: "center" });
      commentEl.style.outline = "1px solid #eab308";
      setTimeout(() => {
        commentEl.style.outline = "";
      }, 2000);
    }
  }
});

// Submit comment
commentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = commentBody.value.trim();
  if (!body || !currentPost) return;

  submitBtn.disabled = true;
  submitBtn.textContent = "...";

  const payload: Record<string, unknown> = {
    body,
    displayName: DISPLAY_NAME,
  };

  if (replyingTo) {
    payload.parentId = replyingTo;
  }

  if (currentAnchor && !replyingTo) {
    Object.assign(payload, currentAnchor);
  }

  try {
    const res = await fetch(
      `${API_BASE}/api/posts/${currentPost.id}/comments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const data = await res.json();
      showError(data.error || "Failed to post comment");
      return;
    }

    commentBody.value = "";
    currentAnchor = null;
    anchorPreview.hidden = true;
    replyingTo = null;
    await loadComments();
  } catch {
    showError("Network error — is the dev server running?");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Post";
  }
});

function showError(msg: string) {
  errorEl.textContent = msg;
  errorEl.hidden = false;
  setTimeout(() => {
    errorEl.hidden = true;
  }, 5000);
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 10) return "just now";
  if (diff < 60) return `${diff}s ago`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderComment(comment: CommentData, isReply = false): HTMLElement {
  const div = document.createElement("div");
  div.className = `comment${isReply ? " reply" : ""}`;
  div.setAttribute("data-comment-id", String(comment.id));

  let html = "";

  if (comment.anchorText && !isReply) {
    html += `<div class="comment-anchor-quote">&ldquo;${escapeHtml(
      comment.anchorText
    )}&rdquo;</div>`;
  }

  html += `
    <div class="comment-header">
      <span class="comment-author">${escapeHtml(comment.displayName)}</span>
      <span class="comment-time">${relativeTime(comment.createdAt)}</span>
    </div>
    <div class="comment-body">${escapeHtml(comment.body)}</div>
  `;

  if (!isReply) {
    html += `
      <div class="comment-actions">
        <button class="reply-btn" data-parent-id="${comment.id}">Reply</button>
      </div>
    `;
  }

  div.innerHTML = html;

  const replyBtn = div.querySelector(".reply-btn");
  if (replyBtn) {
    replyBtn.addEventListener("click", () => {
      toggleReplyForm(comment.id, div);
    });
  }

  return div;
}

function toggleReplyForm(parentId: number, parentEl: HTMLElement) {
  document
    .querySelectorAll(".reply-form-container")
    .forEach((el) => el.remove());

  if (replyingTo === parentId) {
    replyingTo = null;
    return;
  }

  replyingTo = parentId;

  const container = document.createElement("div");
  container.className = "reply-form-container";
  container.innerHTML = `
    <form class="reply-form">
      <input type="text" placeholder="Write a reply..." maxlength="2000" autocomplete="off" />
      <button type="submit">Reply</button>
      <button type="button" class="cancel-btn">Cancel</button>
    </form>
  `;

  const form = container.querySelector("form")!;
  const input = container.querySelector("input")!;
  const cancelBtn = container.querySelector(".cancel-btn")!;

  cancelBtn.addEventListener("click", () => {
    container.remove();
    replyingTo = null;
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = input.value.trim();
    if (!body || !currentPost) return;

    const submitReplyBtn = form.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;
    submitReplyBtn.disabled = true;
    submitReplyBtn.textContent = "...";

    try {
      const res = await fetch(
        `${API_BASE}/api/posts/${currentPost.id}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            body,
            displayName: DISPLAY_NAME,
            parentId,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        showError(data.error || "Failed to reply");
        return;
      }

      replyingTo = null;
      container.remove();
      await loadComments();
    } catch {
      showError("Network error — is the dev server running?");
    } finally {
      submitReplyBtn.disabled = false;
      submitReplyBtn.textContent = "Reply";
    }
  });

  parentEl.after(container);
  input.focus();
}

function renderComments() {
  commentsContainer.innerHTML = "";

  const pageComments = allComments.filter((c) => !c.parentId && c.anchorText);
  const discussionComments = allComments.filter(
    (c) => !c.parentId && !c.anchorText
  );
  const replies = allComments.filter((c) => c.parentId);

  pageCountEl.textContent = String(pageComments.length);
  discussionCountEl.textContent = String(discussionComments.length);

  const activeComments =
    currentTab === "page" ? pageComments : discussionComments;

  if (activeComments.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent =
      currentTab === "page"
        ? "No page comments yet — highlight text to comment"
        : "No comments yet — be the first";
    commentsContainer.appendChild(empty);
    return;
  }

  for (const comment of activeComments) {
    commentsContainer.appendChild(renderComment(comment));

    const commentReplies = replies.filter((r) => r.parentId === comment.id);
    for (const reply of commentReplies) {
      commentsContainer.appendChild(renderComment(reply, true));
    }
  }

  sendAnchorsToContentScript();
}

function sendAnchorsToContentScript() {
  const anchors = allComments
    .filter((c) => c.anchorText && c.anchorSelector)
    .map((c) => ({
      commentId: c.id,
      anchorSelector: c.anchorSelector,
      anchorOffset: c.anchorOffset,
      anchorLength: c.anchorLength,
      anchorText: c.anchorText,
      anchorContextBefore: c.anchorContextBefore,
      anchorContextAfter: c.anchorContextAfter,
    }));

  chrome.runtime.sendMessage({
    type: "HIGHLIGHT_ANCHORS",
    anchors,
  });
}

async function loadComments() {
  if (!currentPost) return;

  try {
    const res = await fetch(
      `${API_BASE}/api/posts/${currentPost.id}/comments`
    );
    const data = await res.json();

    allComments = [];
    for (const c of data.comments || []) {
      const { replies: commentReplies, ...parent } = c;
      allComments.push(parent);
      if (commentReplies) {
        allComments.push(...commentReplies);
      }
    }

    renderComments();
  } catch {
    showError("Failed to load comments");
  }
}

async function init() {
  try {
    const tabInfo = await new Promise<{ url: string; title: string }>(
      (resolve) => {
        chrome.runtime.sendMessage({ type: "GET_TAB_INFO" }, resolve);
      }
    );

    if (!tabInfo?.url) {
      showError("Cannot access this page");
      loading.hidden = true;
      return;
    }

    pageTitle.textContent = tabInfo.title || tabInfo.url;

    const res = await fetch(`${API_BASE}/api/posts/ensure`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: tabInfo.url,
        title: tabInfo.title || undefined,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to connect to server");
    }

    const data = await res.json();
    currentPost = data.post;

    loading.hidden = true;
    mainContent.hidden = false;

    await loadComments();
  } catch (err) {
    loading.hidden = true;
    showError(
      "Failed to connect — make sure the dev server is running at " + API_BASE
    );
    console.error("Init error:", err);
  }
}

init();
