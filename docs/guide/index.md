# User Guide

HamBench is a desktop app for amateur radio memory and live computer control (CAT).

It ships a generic serial driver. Per-radio support comes from **radio modules** — JSON configs you install from GitHub Releases. Install only the radios you own.

## What you can do

- **Read and write memory** on the Radio page (Import / Write), or open and save JSON memory files
- **Edit channels** in the loaded image, and keep a portable **channel library**
- **Live CAT** on radios that declare it (Kenwood TH-F6, TH-D74, TM-D710A): frequency, mode, power, PTT
- **Sniff** clone-protocol traffic between a computer and a radio
- Flag transmit frequencies outside your **license class** (US Callook lookup)

## Start here

1. [Install HamBench](/guide/getting-started)
2. [Install radio modules](/guide/install-radios)
3. [Read and write memory](/guide/radio)
4. [Live CAT](/guide/cat) if your radio supports it

Building a radio module or working on the libraries? See the [Developer docs](/developer/).
