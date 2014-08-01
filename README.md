to investigate why fs.createWriteStream seems to leak memory.  The tests will pass if you set the fileSize to 50KB but tests will start churning like crazy if you set it to something like 200KB

```
npm install
cd tests
mocha tests.js
```
