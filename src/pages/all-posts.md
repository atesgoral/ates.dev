---
layout: layouts/page
title: All Posts
omit: true
---

I write about code, techniques, personal stories from the IT realm.

{% for post in collections.posts reversed %}

#### [{{ post.data.title }}]({{ post.url }})

<p class="project-thumbnail">
  <a href="{{ post.url }}">
    <img src="{{ baseUrl }}{{ post.url }}{{ post.data.image }}" alt="{{ post.data.alt }}">
  </a>
</p>

<p class="meta">{{ post.date | date: "%b %d, %Y" }}</p>

{{ post.data.description }}

<div class="clear"></div>
{% endfor %}
