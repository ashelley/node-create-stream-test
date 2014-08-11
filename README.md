to investigate why fs.createWriteStream seems to be very slow if you don't let the underlying operating system buffer drain by watching the return value of write.  The tests will pass if you set the fileSize to 50KB but tests will start churning like crazy if you set it to something like 200KB

```
npm install
cd tests
mocha tests.js
```

Update:

If you listen to the return value of fs.createStream .write as mentioned in the [here](http://nodejs.org/api/stream.html#stream_event_drain) then you can successfully write to streams.  To see this checkout the "fixed" branch of this repository.


```
git checkout fixed
cd tests
mocha tests.js
```