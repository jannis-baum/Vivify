# Markdown test file

Use this file to test Markdown rendering capabilities.

You may find this useful for tweaking styles as well.

Most examples are copied from https://www.markdownguide.org

## Header

# Heading level 1

## Heading level 2

### Heading level 3

#### Heading level 4

##### Heading level 5

###### Heading level 6

Heading level 1
===============

Heading level 2
---------------

## Line break

End a line with two or more spaces:

This is the first line.  
And this is the second line.

Or with a backslash at the end:

This is the first line.\
And this is the second line.

## Emphasis

I just love **bold text**.

I just love __bold text__.

Love**is**bold

Italicized text is the *cat's meow*.

Italicized text is the _cat's meow_.

A*cat*meow

This text is ***really important***.

This text is ___really important___.

This text is __*really important*__.

This text is **_really important_**.

This is really***very***important text.

## Strikethrough

~~The world is flat.~~ We now know that the world is round.

## Blockquote

> Dorothy followed her through many of the beautiful rooms in her castle.

> Dorothy followed her through many of the beautiful rooms in her castle.
>
> The Witch bade her clean the pots and kettles and sweep the floor and keep the fire fed with wood.

> Dorothy followed her through many of the beautiful rooms in her castle.
>
>> The Witch bade her clean the pots and kettles and sweep the floor and keep the fire fed with wood.

> #### The quarterly results look great!
>
> - Revenue was off the chart.
> - Profits were higher than ever.
>
>  *Everything* is going according to **plan**.

## List

1. First item
2. Second item
3. Third item
4. Fourth item

<br>

1. First item
1. Second item
1. Third item
1. Fourth item

<br>

1. First item
8. Second item
3. Third item
5. Fourth item

<br>

1. First item
2. Second item
3. Third item
    1. Indented item
    2. Indented item
4. Fourth item

<br>

- First item
- Second item
- Third item
- Fourth item

<br>

* First item
* Second item
* Third item
* Fourth item

<br>

+ First item
+ Second item
+ Third item
+ Fourth item

<br>

- First item
- Second item
- Third item
    - Indented item
    - Indented item
- Fourth item


## Code

At the command prompt, type `emacs`.

Indented code block:

    <html>
      <head>
      </head>
    </html>

Triple backticks (fenced code block) and syntax highlighting:

```html
<html>
  <head>
  </head>
  <body>
    <p style="font-size: 1000px">This is some really huge text!</p>
  </body>
</html>
```

## Horizontal Rule

Hi

***

I'm separated

---

Me too
_________________

So yeah anyways

## Link

My favorite search engine is [Duck Duck Go](https://duckduckgo.com).

<https://www.markdownguide.org>

<fake@example.com>

I love supporting the **[EFF](https://eff.org)**.

This is the *[Markdown Guide](https://www.markdownguide.org)*.

See the section on [`code`](#code).

In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat: it was a [hobbit-hole][1], and that means comfort.

[1]: <https://en.wikipedia.org/wiki/Hobbit#Lifestyle> "Hobbit lifestyles"

Auto-linkification:

https://www.markdownguide.org

fake@example.com

Link should not be created in backtics:

`https://www.markdownguide.org`

`fake@example.com`

## Image

![The San Juan Mountains are beautiful!](images/san-juan-mountains.png "San Juan Mountains")

This image is a link, you can click on it:

[![An old rock in the desert](images/shiprock.png "Shiprock, New Mexico by Beau Rogers")](https://www.flickr.com/photos/beaurogers/31833779864/in/photolist-Qv3rFw-34mt9F-a9Cmfy-5Ha3Zi-9msKdv-o3hgjr-hWpUte-4WMsJ1-KUQ8N-deshUb-vssBD-6CQci6-8AFCiD-zsJWT-nNfsgB-dPDwZJ-bn9JGn-5HtSXY-6CUhAL-a4UTXB-ugPum-KUPSo-fBLNm-6CUmpy-4WMsc9-8a7D3T-83KJev-6CQ2bK-nNusHJ-a78rQH-nw3NvT-7aq2qf-8wwBso-3nNceh-ugSKP-4mh4kh-bbeeqH-a7biME-q3PtTf-brFpgb-cg38zw-bXMZc-nJPELD-f58Lmo-bXMYG-bz8AAi-bxNtNT-bXMYi-bXMY6-bXMYv)

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

## Emoji

[Complete list of github emoji](https://github.com/ikatyang/emoji-cheat-sheet/blob/master/README.md)

Gone camping! :tent: Be back soon.

That is so funny! :joy:

:cowboy_hat_face::nerd_face:

## kbd tag

While not a markdown syntax, this has a default style:

Press <kbd>Ctrl</kbd> + <kbd>C</kbd> to copy, and <kbd>Ctrl</kbd> + <kbd>V</kbd> to paste!

## Footnote

Here's a simple footnote,[^1] and here's a longer one.[^bignote]

[^1]: This is the first footnote.

[^bignote]: Here's one with multiple paragraphs and code.

    Indent paragraphs to include them in the footnote.

    `{ my code }`

    Add as many paragraphs as you like.
