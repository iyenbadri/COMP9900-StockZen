sudo apt-get update
sudo apt-get install python3 python3-venv nodejs npm

cd stockzen-backend
python3 -m venv .venv

source .venv/bin/activate
pip3 install wheel
pip3 install -r requirements.txt

cp .flaskenv.default .flaskenv

sed -i "8s/SESSION_KEY=/SESSION_KEY=fiowejjasdiufsidou/1" .flaskenv
sed -i "11s/MAIL_USERNAME=/MAIL_USERNAME=a15b07c5c03683/1" .flaskenv
sed -i "12s/MAIL_PASSWORD=/MAIL_PASSWORD=69cce18ae605e1/1" .flaskenv

cd ..

cd stockzen-frontend
npm install
