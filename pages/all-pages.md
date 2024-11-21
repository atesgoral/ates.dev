---
layout: layouts/page
title: All Pages
---

{{collections | debug}}

<ul>
{% for post in collections.pages %}
<li><a href="{{ page.url }}">{{ page.data.title }}</a></li>
{% endfor %}
</ul>
