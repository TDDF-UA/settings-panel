# [Project Title]

> Fundamentals Pipeline assignment — Technology-Driven Design, University of Antwerp

**Student name:**
**Student ID:**
**Erasmus student (yes/no):**

## 1. Component / Challenge Chosen
<!-- Describe the fundamentals challenge or component this pipeline addresses. What problem does it solve, and why did you pick it? -->

## 2. Model Type: Teachable Machine or Roboflow
<!-- Delete the option you did not use. -->

- [ ] Teachable Machine
- [ ] Roboflow

## 3. Model Files / API Details
<!--
Teachable Machine: export via "Export Model > Download my model" (TensorFlow.js
tab) and commit the three files (model.json, weights.bin, metadata.json) into
a /model folder in this repo — see the worksheet for exact steps. Point
MODEL_URL in script.js at "./model/". Keeping your own copy means your
interface doesn't depend on Google's hosting staying up.
Roboflow: do NOT commit your API key. Describe how the key is supplied
(e.g. prompted client-side, or via config.js, which is gitignored) and link
the Roboflow project/version used.
-->

- Model files location: `/model` (Teachable Machine) or API details (Roboflow):
- API key handling (Roboflow only):

## 4. Known Limitations
<!-- Be honest — this is graded as documentation quality, not as a penalty. E.g. lighting sensitivity, class confusion, latency, mobile camera issues, etc. -->

-
-
-

## 5. Screenshot / GIF
<!-- Add an image or GIF of the app running and reference it here. -->

![demo](./demo.gif)

## 6. Live Demo (GitHub Pages)

**Live link:** https://<username>.github.io/<repo-name>/

## 7. Feedback & Iteration
<!--
This is the core of the exercise: the interface exists so you can put your
model in front of someone and see if it actually works for them.
- Who did you show the working interface to, and what were you trying to find out (your hypothesis)?
- What did they do / say that surprised you?
- What did you change in the model, the interface, or your framing of the challenge as a result?
- Link or reference the commits where that change happened.
-->

**Who I tested with:**
**What I was checking (hypothesis):**
**What I learned:**
**What I changed as a result:**

## 8. Development Notes (optional)
<!-- If you vibe-coded this with an LLM (e.g. Claude Code), briefly note what worked, what it got wrong, and how you fixed it. -->

## 9. Add yourself to the class gallery

Once this repo is live, submit a pull request to the class gallery repo
adding your entry — see its `CONTRIBUTING.md` for the (browser-only,
no local git needed) steps. This is how the instructor and the rest of
the class find your project.

## Repository Structure

```
├── index.html
├── style.css
├── script.js
├── images/              # one subfolder per class — see note below
│   ├── part-7/
│   ├── part-2/
│   └── ...
├── demo.gif             # screenshot or short screen recording
└── README.md
```

**Storing and reloading your dataset:** at 224×224 (Teachable Machine's
working resolution), a typical photo compresses to roughly 15–30 KB, so
even a full set — 500 images × several classes — comes to well under
100 MB, comfortably inside GitHub's limits. Commit the real thing, one
subfolder per class (`images/part-7/`, `images/part-2/`, ...), not a
token sample.

This is for *reloading*, not browsing — Teachable Machine sessions
don't persist once you close the tab, so this folder is how you get
your curated classes back into TM later to retrain:

1. On the repo's GitHub page, **Code → Download ZIP** (downloads
   everything at once — GitHub has no way to grab a single subfolder,
   but the whole repo is small enough that this doesn't matter).
2. Unzip locally.
3. In Teachable Machine, per class: click **Upload**, then select all
   files in that class's subfolder at once (multi-select or drag the
   whole folder's contents in) — not one at a time.

If you'll be reloading repeatedly (adding images over the semester,
retraining more than once), clone the repo instead of re-downloading
each time — **GitHub Desktop → Clone repository**, no command line
needed. Add new photos to the right subfolder, commit, and the same
local folder is always current for the next TM upload.

If a single class folder grows past ~1,000 files, GitHub's own folder
view in the browser gets sluggish (not a size limit, just a UI one) —
worth knowing, not worth avoiding.
