# Using generative AI to contribute

We accept contributions that were created **by humans with the help of**
generative AI tools such as Claude Code and GitHub Copilot. To ensure both the
quality of the project and that our time as voluntary maintainers is respected
and used well, please adhere to the following guidelines when using these
tools.

1. **You, the human, understand and take responsibility for every part of your
   contribution.** Only open a PR when you have fully reviewed and understood
   every line of changed or added code and can comfortably say that you would
   write it like this yourself as well and can answer questions about it
   without additional help from AI. Please do not try to contribute without
   being familiar with the programming languages used here.
2. **You, the human, handle all communication with us in issues and pull
   requests, natural language documentation, and disclose AI usage.** Please
   refrain from including long, overly verbose messages or descriptions your
   agent may produce. If you adhere to point number 1, it should be easy to
   write documentation, descriptions and comments yourself. Remember that we
   will read whatever is posted in human speed with human time so it's only
   fair it's also written that way. Openly disclose what you used AI for and
   which tools you used.
3. **You, the human, verify that nothing broke.** That is, `make install` still
   works, `yarn lint`, `yarn test`, `yarn dev`, and `yarn viv` still work, and
   all rendering tests in [`tests/rendering`](../tests/rendering/) are visually
   confirmed to render as they should.
4. **Both you, the human, and your agent(s) have read this document and our
   [`CONTRIBUTING.md`](./CONTRIBUTING.md)**. You understand and follow
   conventions.
5. **Your agent produces concise and minimal code**. Generative AI has a
   tendency to produce overly verbose code, re-implement things that are
   already there or exist in libraries that should be used instead, and miss
   obvious refactor opportunities. This introduces a bigger maintenance
   overhead, more chances for bugs, and overall bad code. Please keep an extra
   close eye on avoiding this.

We thank you for following these guidelines and hope it will allow a
collaboration framework everyone feels comfortable with.
