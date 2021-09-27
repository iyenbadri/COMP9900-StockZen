# stockzen

_A stock portfolio management webapp_

This README contains setup instructions / suggestions for project devs.
Technical READMEs are located within the respective frontend / backend folders.

---

## Contents:

:whale: [Project Structure](#project-structure)
:bee: [Installation Guide](#installation-guide)
:frog: [Diary](#pushing-your-diary)
:baby_chick: [IDE Tooling: Formatters & Extensions](#IDE-tooling)

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

1. Ensure your `node` (`v14.17.6` - latest LTS) is installed. Do not update `npm`.

   Optional:

   - you can manage your `node` version with `nvm` (Node Version Manager)
   - a `.nvmrc` file is committed to the repo to assist with this. Install `vscode-nvm` extension to always automatically use the correct `node` version

2. Navigate into `stockzen-frontend` and install with `yarn`:

   ```sh
   $ cd stockzen-frontend
   $ yarn
   ```

3. Run:

   ```sh
   $ npm install
   ```

4. To start the frontend development server, do:

   ```sh
   $ yarn start
   ```

   The build will recompile and deploy automatically on saving changes.

### Backend

1. Ensure you have `python3` (`v3.8.10`) installed/updated.

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
