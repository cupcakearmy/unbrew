# 🍺 unbrew

![NPM Version](https://img.shields.io/npm/v/unbrew)
![NPM Wekly Downloads](https://img.shields.io/npm/dt/unbrew)
![NPM License](https://img.shields.io/npm/l/unbrew)


The missing brew cleanup utility.

This is finally the easy way to **clean your forgotten packages and dependencies**.

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

## ☁️ Motivation

Well... anyone that has been using brew in macOS for some time will have encountered the issue of doing a simple `brew list` and discovering loads of packages they have never heard of. Often this is the result of installing some packages that bring dependecies, but since brew does not uninstall them when you delete the package they came with, they will hang around for ever basically.

## 🤷‍♀️ How does it work?

It's actually pretty simple:

1. Check your leaves with `brew leaves`. This basically is a list of all the brew packages that are not required by another one. This means that only the packages you want to have installed + garbage will be a leave.
2. You select which leaves are relevant to you, everything gets deleted over and over again until only your packages and their dependencies are left.
3. We run also `brew cleanup` for good measure
