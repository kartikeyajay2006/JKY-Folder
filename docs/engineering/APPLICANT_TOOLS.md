# Applicant tools

Four features close the most common reasons Indian college, scholarship and job applications are sent back: photographs and signatures outside a portal's limits, applicants under 18 who could not use the product, names and dates of birth that disagree between documents, and uploading the same certificate again for every application.

## Fit a photo or signature

Open a JPEG and choose **Fit to size limits**, use the crop button on a photo in **Documents**, or choose **Fix to fit** on a checklist item whose linked photo fails its file checks. The image is processed only in the browser:

- **Fit to** lists the checklist items that record pixel or file-size limits. **Sizes I enter** accepts a width, height and smallest/largest file size typed from the institution's instructions. Nothing is preset from any portal.
- The frame can be dragged, resized from its corners, sized with a slider, moved with the arrow keys and resized with + and −. Shapes: the limit's own proportions, passport (3.5 × 4.5), square or free. When a width and height are known the frame takes that shape, and the image is never stretched; a frame of the wrong shape fails the checks instead.
- Rotation follows the camera's orientation first. **Whiten the paper background** turns paper white and ink dark for scanned signatures.
- The result is the best-quality JPEG inside the file-size range: quality is searched first, and pixels are reduced (never below a minimum) only when quality alone cannot reach the maximum. Each width, height, size and format check is shown before saving, and **Save** is enabled only when every check passes.
- Saving uploads a new file named like `photo-200x230.jpg` (`POST /api/packets/:id/documents/:documentId/versions`). The server accepts only a JPEG made from an inspected JPEG in the same application, records `derivedFrom` (original name, hash and the list of changes), inspects it like any upload and, when chosen, moves the checklist item's evidence to the new version for fresh review. The original stays unchanged. Canvas re-encoding drops camera metadata such as location.

The fitted file is checked by the same evaluator as every other upload; the browser's checks are a preview.

## Under-18 applicants

Registration asks **I am 18 or older** or **I am under 18**. Under 18 asks for the month and year of birth and a parent's or guardian's email (plan JF-04-06):

- Only the first day the applicant is certainly 18 is stored (the first day of the month after their 18th birthday month). Applicants younger than 13 are asked to have a parent or guardian create the account. The guardian's email must differ from the applicant's.
- The account exists immediately, but until approval the server answers anything that would add or process documents (applications, uploads, support requests, notifications) with a 403; only the account itself, its activity and the guardian request can be used. The applicant sees a waiting page that resends the request (at most once a minute and five times a day), sends it to a different adult, checks for approval every 15 seconds, or deletes the account.
- The guardian's email links to a page that explains what the product does and does not do. Approval records the guardian's name, relationship (parent or legal guardian) and consent; **Don't approve** declines. Approval links last 7 days, are single-use and stop working when the request is sent to a different address.
- After approval the guardian receives a second link that works until 30 days after the applicant turns 18. **Withdraw** (typing WITHDRAW) erases the account, every application and every original through the normal account-deletion path, including the deletion ledger.
- Accounts not approved within 14 days of registration are erased by the hourly sweep. On the applicant's 18th-birthday date the guardian arrangement ends, its links stop working and the activity records it.
- Under-18 registration needs email delivery. In development without SMTP the server uses the local outbox; production without SMTP refuses under-18 sign-up with a clear message.

Changing the applicant's password does not revoke the guardian's links. Guardian identity is not verified beyond control of the email address; a qualified legal review of the age and guardian policy remains a release gate.

## Name and date of birth

The **Name and date of birth** panel (application overview and Documents) lists the name and date of birth each document shows and compares them with one reference: the value most documents share (confirmed values first), or a document chosen under **Compare with**. That choice is a display preference and does not change reports.

- Capitals, titles (Mr, Kumari, Shri…), punctuation, spacing and date formats are not differences: `KARTIKEYA YADAV`, `Mr. Kartikeya Yadav`, `12/03/2008`, `2008-03-12` and `12th March, 2008` all match.
- Differences are named: different order, initials, a word missing or added (often a middle name or surname), spelling, a different name, day and month swapped, or a value that cannot be read. Numeric dates are read day first, as Indian certificates print them.
- Values read automatically are marked **Not confirmed yet**; each opens the document at its page with the value highlighted for confirmation or correction.
- Reports keep their stricter rule: only confirmed values count, and a real difference makes the report "review required" with a reason that names the kind of difference.

Extraction now reads labelled candidate names ("Candidate Name", "Name of the Student"…) and ignores the names of parents, schools, boards and other people on the same certificate. Identity cards that print the name unlabelled above the date of birth are recognised. Dates written with month names are read. These rules apply to documents inspected from this version on; earlier documents keep their extracted values, and the evaluator version changed to 2.1.0 so earlier reports show as historical.

## My documents

**My documents** lists every original once, grouped by content, with the applications that hold it. **Add to…** places it in another application; inside an application, **From my documents** picks several at once.

Adding copies the stored bytes and the inspection result (pages, extracted text, confirmed and corrected facts) into the target application, marked "Added from My documents". Copies are independent: deleting one application or one copy never affects another, and erasure keeps working per application. Each target application's file and size limits still apply, a file already present is skipped, and only inspected originals can be added. The library is private to the account; documents can never be added from another account.
