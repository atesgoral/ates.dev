---
layout: layouts/page
title: All Pages
---

<ul>
{% for page in collections.pages %}
<li><a href="{{ page.url }}">{{ page.data.title }}</a></li>
{% endfor %}
</ul>
