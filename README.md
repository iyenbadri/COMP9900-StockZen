# stockzen

Setup instructions for project devs.

## Folders

- Frontend code: `./stockzen-frontend`
- Backend code: `./stockzen-backend`
  - Backend server code: `./stockzen-backend/app`
  - ML code: `./stockzen-backend/predict`
- Diary storage: `./diary`

## Installation

_The following instructions assume UNIX-based OS. If you are on Windows, you need to install WSL Ubuntu or develop on VLab._

### Frontend

1. Ensure you `node` (`v14.17.6`) installed/updated.

   - Optional: you can manage your `node` version with `nvm` (Node Version Manager)
   - a `.nvmrc` file is committed to the repo to assist with this

2. Run:

   ```sh
   yarn
   ```

3. Run:

   ```sh
   npm install
   ```

4. To start the frontend development server, do:

   ```sh
   yarn start
   ```

   The build will recompile and deploy automatically on saving changes.

### Backend

1. Ensure you have `python3` (`v3.8.10`) installed/updated.

2. Navigate into `./stockzen-backend` and set up a Python virtual environment with::

   ```sh
   cd stockzen-backend
   python -m venv .venv
   ```

3. Everytime you work on the backend, ensure you have done:

   ```sh
   source .venv/bin/activate
   ```

   - Optional:
     add `alias venv="source .venv/bin/activate"` to the bottom of your `~/.bashrc` file so that the environment to be activated by just typing:
     ```sh
     venv
     ```

4. While still in `stockzen-backend`, activate `venv` and then install Python dependencies with:

   ```sh
   pip install -r requirements.txt
   ```

   This will have to be done after every `git pull` to ensure you always have the latest dependencies

5. Request for the `.flaskenv` file from another dev. It should sit in `./stockzen-backend/` and holds the environment variables and flask session secret key.

6. To start the backend development server, from `stockzen-backend` do:

   ```sh
   flask run
   ```

   The build will recompile and deploy automatically on saving changes, but a manual refresh of the Swagger page may be necessary to fetch the latest changes.

#### _Note: remember to switch `FLASK_ENV` to `production` when deploying final build_
