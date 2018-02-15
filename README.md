snappin [![NPM Version](https://img.shields.io/npm/v/snappin.svg)](https://www.npmjs.com/package/snappin) [![NPM License](https://img.shields.io/npm/l/snappin.svg)](https://www.npmjs.com/package/snappin)
=======
[![NPM Downloads](https://img.shields.io/npm/dm/snappin.svg)](https://www.npmjs.com/package/snappin)
[![Dependency Status](https://img.shields.io/david/tivac/snappin.svg)](https://david-dm.org/tivac/snappin)
[![devDependency Status](https://img.shields.io/david/dev/tivac/snappin.svg)](https://david-dm.org/tivac/snappin#info=devDependencies)

Take timed screenshots while developing your website.


## :warning: :zap: :warning: This project is UNMAINTAINED :warning: :zap: :warning:

## Install

```bash
npm i snappin
```

## Usage

```bash
$ snappin

    Usage
        $ snappin --time 30s localhost:3000
        
    Options
        --time,  -t  Interval between captures
        --dir,   -d  Directory to save captures to (./snaps)
        --wait,  -w  Delay initial snap by a specified time (5s)
        --level, -l  Logging level (info)
        --delay, -y  Delay capture after page load (1s)
        --res,   -r  Viewport resolution (1366x768)
```
