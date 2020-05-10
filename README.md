# 🍺 unbrew

The missing brew cleanup utility.

![Demo Video](https://github.com/cupcakearmy/unbrew/raw/master/.github/demo.gif)

## 📦 Installation

### Single use
```
npx unbrew
```

### Permanent install

```
npm -g install unbrew
# or
yarn global add unbrew
```

```
# Run
unbrew
```

## 🤔 Motivation

Well... anyone that has been using brew in macOS for some time will have encountered the issue of doing a simple `brew list` and discovering loads of packages they have never heard of. Often this is the result of installing some packages that bring dependecies, but since brew does not uninstall them when you delete the package they came with, they will hang around for ever basically.
