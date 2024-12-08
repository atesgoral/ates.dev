---
layout: layouts/page
title: All Pages
omit: true
---

<ul>
{% for page in collections.pages %}
<li><a href="{{ page.url }}">{{ page.data.title }}</a></li>
{% endfor %}
</ul>
