# simple-webserver

Simple HTTP and HTTPS webserver to host static files

## Running simple-webserver

How to use this:
1. Clone ro download this repository
2. Install the dependencies
```
$ npm install
```
3. Run the software
```
$ node main.js
```

## Adding basicAuth

If basicAuth is enabled, the usual basic authentication prompt will be shown asking for password. The default password is set in main.js function basicAuth(req, res, next)
```javascript
const auth = { login: 'admin', password: 'P@ssw0rd' } // change this
```
This line shows that basicAuth is inserted at the beginning of ExpressJS middleware:
```javascript
    // with basic authentication
    obj.app.use(basicAuth, obj.express.static(__dirname+'/public'), obj.serveindex(__dirname+'/public', {'icons': true}));
    // without basic authentication
    //obj.app.use(obj.express.static(__dirname+'/public'), obj.serveindex(__dirname+'/public', {'icons': true}));
```

To disable basicAuth, 

```javascript
    // with basic authentication
    //obj.app.use(basicAuth, obj.express.static(__dirname+'/public'), obj.serveindex(__dirname+'/public', {'icons': true}));
    // without basic authentication
    obj.app.use(obj.express.static(__dirname+'/public'), obj.serveindex(__dirname+'/public', {'icons': true}));
```

Have fun.

Oh btw, the root certificate of the issuer is downloadable (root.cer) for your convenience to load this into your trusted certificate storage.
