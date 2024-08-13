---
layout: archive
title: "CV"
permalink: /cv/
author_profile: true
redirect_from:
  - /resume
---

{% include base_path %}

# Education

- HS Saint Josephs Preparatory School 2023
- B.S.E Computer Science and Mathematics 2027 (expected)

# Skills

- Programming Languages

  - Java, Python, C/C++, HTML, Haskell, Ocaml

- Libraries

  - Numpy, Pandas

- Mathematics

  - Linear algebra, Complex analysis, Abstract Algebra, Graph Theory, Algorithms

- Languages
  - English (native), Japanese (elementary)

# Publications

  <ul>{% for post in site.publications reversed %}
    {% include archive-single-cv.html %}
  {% endfor %}</ul>
  
<!-- Talks
======
  <ul>{% for post in site.talks reversed %}
    {% include archive-single-talk-cv.html  %}
  {% endfor %}</ul>
   -->
Teaching
======
  <ul>{% for post in site.teaching reversed %}
    {% include archive-single-cv.html %}
  {% endfor %}</ul>
  
Service and leadership
======
* Member of Upenn Stwing
