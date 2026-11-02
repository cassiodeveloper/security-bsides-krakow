# BSides Kraków Hacker Club — Project Board

Got an idea? Build it with us. This is the community home for ideas, native GitHub voting and approved Hacker Club projects. Beginners and experienced hackers are equally welcome.

- [Propose an idea](https://github.com/Security-BSides-Krakow/hacker-club-projects/discussions/new?category=project-ideas): give your discussion a short title and complete the friendly form. No technical specification is required.
- [Vote and discuss](https://github.com/Security-BSides-Krakow/hacker-club-projects/discussions/categories/project-ideas): use GitHub's native upvote arrow. Explain what interests you and offer constructive feedback.
- Volunteer by commenting on the original Discussion or the approved project's Issue. Say what you would like to learn or contribute; documentation, testing, design and mentoring all count.
- [Track approved projects](https://github.com/orgs/Security-BSides-Krakow/projects/1): Issues describe actionable work; the public Project records status, category, assignees and priority.
- Browse the website at https://bsideskrakow.pl/hacker-club/projects/ once the website release is deployed. Browsing never requires authentication. Participation on GitHub requires an account.

## Selection and governance

Votes help organizers understand interest. High vote counts do not guarantee approval. BSides Kraków organizers may prioritize, postpone or decline proposals based on feasibility, safety, resources and community benefit. Be welcoming, collaborative and inclusive of varying skill levels. Follow the [Code of Conduct](https://bsideskrakow.pl/code-of-conduct.html).

Proposed → Under Review → Planned → In Progress → Completed. On Hold means temporarily paused. These exact names are used throughout. Discussions are the entry point; only approved projects get an execution Issue and enter the Project. A declined idea stays in Discussions with an explanation; it is not presented as completed work.

## Administrator guide

1. Review ideas with their authors. An organizer can add the `status:under-review` label while evaluating feasibility and interest.
2. When approving, first search Issues for the original Discussion URL to prevent duplicates. Create one tracking Issue, retaining the original Discussion (do not convert or delete it). Copy its description and use the metadata headings below.
3. Add the Issue to the public Project. Set Status to Planned, Category to the matching category, Original Discussion to its canonical URL, and optional Priority. Assign a maintainer only after they agree. Link the Issue back from a comment on the Discussion.
4. Maintain Status in the Project. Move to In Progress, On Hold or Completed as appropriate. Record decisions and delivery evidence in the Issue. Closing an Issue alone does not update the website status; update the Project's Status too.
5. Publish results and lessons, then mark Completed. Do not remove completed items from the Project: the website uses them as its historical record.

Approved Issue body contract:

```markdown
### Description

What we are building and the agreed scope.

### Original Discussion

https://github.com/Security-BSides-Krakow/hacker-club-projects/discussions/NUMBER
```

Use exactly one plain canonical URL under Original Discussion. Set the same URL in the Project text field for convenient administration. The exporter uses the Issue body as the durable link and merges the Issue and Discussion into one public identity. Deleted Discussions result in unavailable votes and no voting link; the approved Issue remains visible.

Category labels use the exact public category names. Additional categories are welcome: add a label and a Project Category option with the same name. The website discovers new exported categories automatically.

Proposals in `proposals/` are suggested starting points, not approvals. No maintainer, schedule, votes or progress is implied. The website synchronization code and deployment instructions live in the website repository under `scripts/` and `docs/project-board/`.
