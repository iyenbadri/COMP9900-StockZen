# StockZen

[![Backend Test](https://github.com/unsw-cse-comp3900-9900-21T3/capstone-project-9900-h18c-codependent/actions/workflows/backend-test.yml/badge.svg)](https://github.com/unsw-cse-comp3900-9900-21T3/capstone-project-9900-h18c-codependent/actions/workflows/backend-test.yml)
[![Frontend Test](https://github.com/unsw-cse-comp3900-9900-21T3/capstone-project-9900-h18c-codependent/actions/workflows/frontend-test.yml/badge.svg)](https://github.com/unsw-cse-comp3900-9900-21T3/capstone-project-9900-h18c-codependent/actions/workflows/frontend-test.yml)

_A stock portfolio management webapp_

This README is divided into setup instructions for users and project devs.

# User Manual

## Installation

## User Guide

# Developer Manual

Technical READMEs are located within the respective frontend / backend folders.

---

## Contents:

🐳 [Project Structure](#project-structure)
🐝 [Installation Guide](#installation-guide)
🐸 [Diary](#pushing-your-diary)
🐣 [IDE Tooling: Formatters & Extensions](#ide-tooling)
🐶 [Branching / Pull Requests](#development-practices)

---

## Project Structure

- Frontend code: `./stockzen-frontend`
- Backend code: `./stockzen-backend`
  - Backend server code: `./stockzen-backend/app`
  - ML code: `./stockzen-backend/predict`
- Diary storage: `./diary` (see [Pushing your diary](#pushing-your-diary))

---

## Installation Guide

_The following instructions assume UNIX-based OS. If you are on Windows, you need to install WSL Ubuntu or develop on VLab._

### Frontend

1. Ensure your `node` (`v10.19.0`) is installed. Do not update `npm`.

   Optional:

   - you can manage your `node` version with `nvm` (Node Version Manager)
   - a `.nvmrc` file is committed to the repo to assist with this. Install `vscode-nvm` extension to always automatically use the correct `node` version

2. Ensure `yarn` is installed. Otherwise:

   ```sh
   $ npm install --global yarn
   ```

3. Navigate into `stockzen-frontend` and install with `yarn`:

   ```sh
   $ cd stockzen-frontend
   $ yarn
   ```

4. Run:

   ```sh
   $ npm install
   ```

   _Note: `npm install` needs to be run after every `git pull` in case there are new dependencies_

5. To start the frontend development server, do:

   ```sh
   $ yarn start
   ```

   The build will recompile and deploy automatically on saving changes.

### Backend

1. Ensure you have `python3` (`v3.8.2`) installed/updated.

2. Navigate into `./stockzen-backend` and set up a Python virtual environment with::

   ```sh
   $ cd stockzen-backend
   $ python -m venv .venv
   ```

3. Everytime you work on the backend, ensure you have done:

   ```sh
   $ source .venv/bin/activate
   ```

   - Optional:
     Add `alias venv="source .venv/bin/activate"` to the bottom of your `~/.bashrc` file so that the environment to be activated by just typing:
     ```sh
      $ venv
     ```

4. While still in `stockzen-backend`, activate `venv` and then install Python dependencies with:

   ```sh
   $ pip install -r requirements.txt
   ```

   This will have to be done after every `git pull` to ensure you always have the latest dependencies

5. Request for the `.flaskenv` file from another dev. It should sit in `./stockzen-backend/` and holds the environment variables and flask session secret key.

   - this is a good time to visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key) to get your own API Key for use in development
   - add this key to the bottom of `stockzen-backend/.flaskenv` as a new line: `AV_API_KEY=<your-api-key>`
   - `AV_API_KEY` can then be used anywhere with the Python `alpha_vantage` package when querying the API

6. To start the backend development server, from `stockzen-backend` do:

   ```sh
   $ flask run
   ```

   The build will recompile and deploy automatically on saving changes, but a manual refresh of the Swagger page may be necessary to fetch the latest changes.

_Note: remember to switch `FLASK_ENV` to "production" when deploying final build_

➡️ _Shortcut_:
_Once you have set everything up, VSCode has been configured so you can just do: `ctrl+p` and enter`task Dev` to start all development servers at once_

---

## Pushing your diary:

1. Checkout the diary branch:
   ```sh
   $ git checkout diary
   ```
   - If you have uncommitted changes on your current branch, then do this first:
     ```sh
     $ git stash
     ```
2. Pull to update `diary` branch:

   ```sh
   $ git pull
   ```

3. Commit your latest diary:

   ```sh
   $ git add ./diary/zXXXXXXX.txt
   $ git commit -m "Update diary - <dev-initials>"
   ```

   where `<dev-initials>` is like `KL`

4. Push your changes:

   ```sh
   $ git push
   ```

5. Switch back to your original branch and unstash to resume work:

   ```sh
   $ git checkout <orignal-branch-name>
   $ git stash pop
   ```

_Note: `diary` branch will be merged into `main` at the end of each sprint_

---

## IDE Tooling

Below are suggestions for toolings.
The only necessary ones are the **Formatters**, so that committed code is consistent, keeping `git` diffs cleaner and Peer Reviews easier.

_Note: The below assumes `VS Code` IDE is being used_

| Language | Formatter    | Linter      | Lang. Server |
| -------- | ------------ | ----------- | ------------ |
| Python   | _black_      | Python (MS) | Pylance      |
| JS       | _ Prettier _ | ESLint      | -            |

Other useful extensions:

- **vscode-nvm** - automatically uses the correct `node` version
- **Git Graph** - clear graphical representation of `git` history
- **Todo Tree** - nicely collects all `TODO:`, `FIXME:`, `BUG:`, etc tags in a tab
- **SQLite** - perform independent SQL queries in a separate window

---

## Development Practices

- **Types of branches:**
  `feat` - new feature, coming from a Jira subtask
  `bugfix` - fixing something previously commited that has bugs
  `review` - just a code review, but might refactor or make some changes

* **Naming convention:**
  We will use the following pattern for branch names:
  `<type>-<f/b>/<descriptive-name>`
  where f = frontend, b = backend

### 🌿 **Creating a new branch**

You will most often create a new branch when you start working on a new feature (i.e. when a new subtask is assigned to you)

**Example subtask: `Frontend Registration page and input validation`**
You can create a branch from either the command line or from VS Code.

- With CLI:

  ```sh
  git checkout -b feat-f/registration-page  <--this is your local branch
  git push -u origin feat-f/registration-page  <--this sets the remote ("online") branch
  ```

- With VS Code:
  i. Click on the branch icon on the bottom left:
  ![branchicon](https://code.visualstudio.com/assets/docs/editor/versioncontrol/git-status-bar-sync.png)
  ii. Click on "Create new branch":
  ![newbranch](https://code.visualstudio.com/assets/docs/editor/versioncontrol/gitbranches.png)
  iii. Enter `feat-f/registration-page`
  iv. Click on the cloud icon to push your new branch to github:
  ![cloudicon](https://code.visualstudio.com/assets/docs/editor/versioncontrol/git-status-bar-publish.png)

You can now start working from here, and make commits and pushes etc.

### 🤝 **Pull Requests**

Pull Requests are for when you're done with your part and you want to submit/merge your changes to `main` - someone will need to review your code before this can happen.
(You could also PR when you just need a peer review - use the `draft` PR option)

Please ensure you have tested your feature as much as possible before requesting a PR - the reviewer should not need to test that everything works.

1. Create a PR:

   - If you have recently pushed your branch to github, there will be a banner that says `Create pull request` which you can click on

   - Otherwise navigate to the Pull Requests tab and click `New pull request`

2. Follow the pre-loaded PR template instructions to complete the PR details.

3. Add a `reviewer` and add yourself as `initiator`

4. Add an appropriate tag. Submit. Wait for feedback.
