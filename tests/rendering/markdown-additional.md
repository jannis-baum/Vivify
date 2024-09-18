# Additional Markdown test file

Test various other Markdown syntax here, starting with the table of contents

[[toc]]

## Relative file link

See basic syntax [here](markdown-basic.md), and extended syntax [here](markdown-extended.md)!

## Math

Let's define the Normal distribution $N(x; \mu, \sigma^2)$ as follows.

$$
N(x; \mu, \sigma^2) = \frac{1}{\sqrt{2 \pi \sigma^2}} \cdot \exp\left(-\frac{\left(x - \mu\right)^2}{\sigma^2}\right)
$$

## Graphviz/Dot

```graphviz
digraph {
  rankdir = LR
  A -> B
}
```

## Mermaid

```mermaid
flowchart LR

A[Hard] -->|Text| B(Round)
B --> C{Decision}
C -->|One| D[Result 1]
C -->|Two| E[Result 2]
```

## \<kbd> tag

While not a markdown syntax, this has a default style:

Press <kbd>Ctrl</kbd> + <kbd>C</kbd> to copy, and <kbd>Ctrl</kbd> + <kbd>V</kbd> to paste!

## Custom attribute

This paragraph has a red background color.{style=background-color:red}

## GitHub style alert

### The 5 default GitHub style alerts

> [!NOTE]  
> Something to take into account

> [!TIP]
> Did you know you can do this and that

> [!IMPORTANT]  
> Crucial information here

> [!WARNING]  
> Critical content demanding immediate attention

> [!CAUTION]
> Do not do this and that!

### With a custom title

> [!NOTE] Foo bar
> 'Note' with a custom title

### Using custom markers ([Obsidian Callout](https://help.obsidian.md/Editing+and+formatting/Callouts) style)

> [!CUSTOM]
> Something more special

> [!fOoBaR]
> The marker is case-insensitive and turns into Title Case

> [!CUSTOM] paY aTtEntiOn
> You can use a custom title with a custom marker as well
