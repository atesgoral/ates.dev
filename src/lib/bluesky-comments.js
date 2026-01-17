(() => {
  const container = document.getElementById('bluesky-comments');
  if (!container) return;

  const postUrl = container.dataset.postUrl;
  if (!postUrl) return;

  // Convert Bluesky URL to AT URI
  // https://bsky.app/profile/ates.dev/post/3lbyjgfrxkc2j -> at://ates.dev/app.bsky.feed.post/3lbyjgfrxkc2j
  const match = postUrl.match(/bsky\.app\/profile\/([^/]+)\/post\/([^/]+)/);
  if (!match) return;

  const [, handle, rkey] = match;
  const uri = `at://${handle}/app.bsky.feed.post/${rkey}`;

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function renderComment(comment, depth = 0) {
    const maxDepth = 3;
    const isMaxDepth = depth >= maxDepth;

    const div = document.createElement('div');
    div.className = 'bsky-comment' + (depth > 0 ? ' bsky-reply' : '');

    const authorUrl = `https://bsky.app/profile/${comment.author.handle}`;
    const postUrl = `https://bsky.app/profile/${comment.author.handle}/post/${comment.uri.split('/').pop()}`;

    div.innerHTML = `
      <div class="bsky-comment-header">
        ${comment.author.avatar ? `<img src="${comment.author.avatar}" alt="" class="bsky-avatar">` : ''}
        <a href="${authorUrl}" target="_blank" rel="noopener" class="bsky-author">
          ${comment.author.displayName || comment.author.handle}
        </a>
        <span class="bsky-handle">@${comment.author.handle}</span>
        <a href="${postUrl}" target="_blank" rel="noopener" class="bsky-date">${formatDate(comment.createdAt)}</a>
      </div>
      <div class="bsky-comment-text">${escapeHtml(comment.text)}</div>
      <div class="bsky-comment-meta">
        ${comment.likeCount ? `<span>${comment.likeCount} like${comment.likeCount !== 1 ? 's' : ''}</span>` : ''}
        ${comment.replyCount ? `<span>${comment.replyCount} repl${comment.replyCount !== 1 ? 'ies' : 'y'}</span>` : ''}
      </div>
    `;

    if (comment.replies && comment.replies.length > 0) {
      if (isMaxDepth) {
        const moreLink = document.createElement('a');
        moreLink.href = postUrl;
        moreLink.target = '_blank';
        moreLink.rel = 'noopener';
        moreLink.className = 'bsky-more-replies';
        moreLink.textContent = `View ${comment.replies.length} more repl${comment.replies.length !== 1 ? 'ies' : 'y'} on Bluesky`;
        div.appendChild(moreLink);
      } else {
        const repliesDiv = document.createElement('div');
        repliesDiv.className = 'bsky-replies';
        comment.replies.forEach((reply) => {
          repliesDiv.appendChild(renderComment(reply, depth + 1));
        });
        div.appendChild(repliesDiv);
      }
    }

    return div;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function parseThread(thread) {
    if (!thread || thread.$type !== 'app.bsky.feed.defs#threadViewPost') {
      return null;
    }

    const post = thread.post;
    const record = post.record;

    const replies = [];
    if (thread.replies) {
      for (const reply of thread.replies) {
        const parsed = parseThread(reply);
        if (parsed) replies.push(parsed);
      }
      replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    return {
      uri: post.uri,
      author: {
        handle: post.author.handle,
        displayName: post.author.displayName,
        avatar: post.author.avatar,
      },
      text: record.text,
      createdAt: record.createdAt,
      likeCount: post.likeCount || 0,
      replyCount: post.replyCount || 0,
      replies,
    };
  }

  function render(thread) {
    container.innerHTML = '';

    if (!thread) {
      container.innerHTML = '<p class="bsky-error">Could not load comments. <a href="' + postUrl + '" target="_blank" rel="noopener">View on Bluesky</a></p>';
      return;
    }

    const stats = document.createElement('div');
    stats.className = 'bsky-stats';
    stats.innerHTML = `
      <span>${thread.likeCount} like${thread.likeCount !== 1 ? 's' : ''}</span>
      <span>${thread.replyCount} repl${thread.replyCount !== 1 ? 'ies' : 'y'}</span>
      <a href="${postUrl}" target="_blank" rel="noopener">Reply on Bluesky</a>
    `;
    container.appendChild(stats);

    if (thread.replies.length === 0) {
      const noComments = document.createElement('p');
      noComments.className = 'bsky-no-comments';
      noComments.textContent = 'No comments yet.';
      container.appendChild(noComments);
      return;
    }

    const commentsDiv = document.createElement('div');
    commentsDiv.className = 'bsky-comments-list';
    thread.replies.forEach((reply) => {
      commentsDiv.appendChild(renderComment(reply));
    });
    container.appendChild(commentsDiv);
  }

  container.innerHTML = '<p class="bsky-loading">Loading comments...</p>';

  fetch(`https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(uri)}&depth=6`)
    .then((res) => res.json())
    .then((data) => {
      const thread = parseThread(data.thread);
      render(thread);
    })
    .catch(() => {
      container.innerHTML = '<p class="bsky-error">Could not load comments. <a href="' + postUrl + '" target="_blank" rel="noopener">View on Bluesky</a></p>';
    });
})();
