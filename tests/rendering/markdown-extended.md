# Extended Markdown test file

Use this file to test extended Markdown rendering capabilities.

https://www.markdownguide.org/extended-syntax/

## Table

| Syntax      | Description |
| ----------- | ----------- |
| Header      | Title       |
| Paragraph   | Text        |

| Syntax      | Description | Test Text     |
| :---        |    :----:   |          ---: |
| Header      | Title       | Here's this   |
| Paragraph   | Text        | And more      |
| Table       | Rectangular | Hehe          |

## Fenced code block

A normal fenced code block with no syntax highlighting:

```
# Plain text
# no highlighting here...

<h1>Some embedded html</h1>

$foo = "Hello World"
```

With syntax highlighting:

```html
<html>
  <head>
  </head>
  <body>
    <p style="font-size: 1000px">This is some really huge text!</p>
  </body>
</html>
```

## Custom heading ID

### My Great Heading {#custom-id}

[Custom heading ID](#custom-id)

## Definition list

dog
    : a domesticated canid
    : a clamp binding together two timbers
    : an utter failure; flop

cat
    : a small domesticated carnivore
    : a devotee of jazz
    : a movable shelter for providing protection when approaching a fortification

Paragraphs in definition:

term

:   This is the first paragraph.

    This is the second paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed congue egestas est at maximus. Ut blandit ligula nec iaculis dignissim. Duis ut diam nibh. Curabitur sed consectetur lacus. Integer fringilla metus quis justo condimentum iaculis. Vivamus arcu metus, luctus id posuere eget, rutrum eu neque. Donec a lectus mauris. Etiam magna eros, commodo ut lectus id, finibus sodales est. Suspendisse quis rhoncus purus.

    Hello from the third paragraph!

There's no markdown syntax for this, but technically multiple terms for one definition are allowed:

<dl>
    <dt>Firefox</dt>
    <dt>Mozilla Firefox</dt>
    <dt>Fx</dt>
    <dd>A free, open source, cross-platform, graphical web browser
        developed by the Mozilla Corporation and hundreds of volunteers.</dd>
</dl>

## Strikethrough

~~The world is flat.~~ We now know that the world is round.

## Task list

Simple:

- [x] Write the press release
- [ ] Update the website
- [ ] Contact the media

Nested with other types of list:

- Monday
    - chore day
        1. wash dishes
            - [x] done
        2. mow lawn 
            - [ ] done
        3. take out trash
            - [ ] done
    - [ ] day completed
- Sunday
    - chill day
        1. sleep
            - [ ] done
        2. take a bath
            - [ ] done
        3. play guitar
            - [ ] done
    - [ ] day completed

## Emoji

[Complete list of github emoji](https://github.com/ikatyang/emoji-cheat-sheet/blob/master/README.md)

Gone camping! :tent: Be back soon.

That is so funny! :joy:

:cowboy_hat_face::nerd_face:

## Highlight/Mark

I need to highlight/mark these ==very important words==. There can also be
longer highlighted sections which may be relevant for testing styles:

Lorem ipsum dolor sit amet, consectetur adipiscing elit, ==sed do eiusmod tempor
incididunt ut labore et dolore magna aliqua. Amet justo donec enim diam
vulputate ut pharetra sit amet. Neque egestas congue quisque egestas diam in.
Risus at ultrices mi tempus imperdiet nulla malesuada pellentesque elit. Massa
placerat duis ultricies lacus sed turpis tincidunt id aliquet. Lacus sed viverra
tellus in hac habitasse platea dictumst. Facilisi morbi tempus iaculis urna id.
Feugiat in fermentum posuere urna. Ultricies tristique nulla aliquet enim
tortor. Vitae congue mauris rhoncus aenean.== Mi eget mauris pharetra et ultrices
neque. Tincidunt vitae semper quis lectus nulla.

## Subscript

H~2~O

## Superscript

X^2^

## Automatic URL linking

Without any formatting, URLs should still become links:

https://www.markdownguide.org

fake@example.com

Link should not be created in backtics:

`https://www.markdownguide.org`

`fake@example.com`

## Footnote

Here's a simple footnote,[^1] and here's a longer one.[^bignote]

[^1]: This is the first footnote.

[^bignote]: Here's one with multiple paragraphs and code.

    Indent paragraphs to include them in the footnote.

    `{ my code }`

    Add as many paragraphs as you like.
