# Gibs Finance

run the gibs site on any system you wish

install

```sh
yarn
```

copy the `.example.env` to `.env` and source the file

build and start the code

```sh
yarn run build && yarn run ui:preview
```

open `localhost:4173`

## development

```sh
yarn run dev
```

## embed

to view an embed example, start a static server at the root and visit the `frame.html` on your local server

## publishing

to increment to a new version, simply run `npm version patch` or minor or major, and a script will take care of updating the monorepo's packages
