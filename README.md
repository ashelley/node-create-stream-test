to investigate why fs.createWriteStream seems to leak memory.  The tests will pass if you set the fileSize to 50Kb but tests will start churning like crazy if you set it to something like 200Kb

```
cd tests
mocha tests.js
```
