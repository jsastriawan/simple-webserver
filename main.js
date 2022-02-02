/**
 * @description Main.js
 * @author Joko Sastriawan
 * @copyright Joko Sastriawan 2020
 * @license Apache-2.0
 * @version 0.0.1
 */
function basicAuth(req,res,next) {
    // -----------------------------------------------------------------------
    // authentication middleware

    const auth = { login: 'admin', password: 'P@ssw0rd' } // change this

    // parse login and password from headers
    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')

    // Verify login and password are set and correct
    if (login && password && login === auth.login && password === auth.password) {
        // Access granted...
        return next()
    }

    // Access denied...
    res.set('WWW-Authenticate', 'Basic realm="Simple authentication"') // change this
    res.status(401).send('Authentication required.') // custom message
    // -----------------------------------------------------------------------
}

function CreateSimpleWebserver() {
    var obj = {}
    obj.fs = require('fs');
    obj.express = require('express');
    obj.app = obj.express();
    obj.serveindex = require('serve-index');     
    obj.http = require('http');
    obj.https = require('https');

    obj.config = {};
    try {
        obj.config = JSON.parse(obj.fs.readFileSync('private/config.json'));
    } catch (e) {
        console.log(e);
    }

    obj.Start = function () {
        var certificates = {}
        certificates.root = {}
        certificates.web = {}

        var certoperation = require('./certoperations.js').CertificateOperations();

        var rootCertificate, rootPrivateKey, rootCertAndKey;

        if (obj.fs.existsSync('private/root-cert-public.crt') && obj.fs.existsSync('private/root-cert-private.key')) {
            //load certificate
            rootCertificate = obj.fs.readFileSync('private/root-cert-public.crt', 'utf8');
            rootPrivateKey = obj.fs.readFileSync('private/root-cert-private.key', 'utf8');
            rootCertAndKey = { cert: certoperation.pki.certificateFromPem(rootCertificate), key: certoperation.pki.privateKeyFromPem(rootPrivateKey) }
        } else {
            console.log('Generating Root certificate...');
            rootCertAndKey = certoperation.GenerateRootCertificate(true, 'WebsiteRoot', null, null, true);
            rootCertificate = certoperation.pki.certificateToPem(rootCertAndKey.cert);
            rootPrivateKey = certoperation.pki.privateKeyToPem(rootCertAndKey.key);
            obj.fs.writeFileSync('private/root-cert-public.crt', rootCertificate);
            obj.fs.writeFileSync('private/root-cert-private.key', rootPrivateKey);
        }
        certificates.root.cert = rootCertificate;
        certificates.root.key = rootPrivateKey;

        var webCertificate, webPrivateKey, webCertAndKey;

        if (obj.fs.existsSync('private/web-cert-public.crt') && obj.fs.existsSync('private/web-cert-private.key')) {
            //load certificate
            webCertificate = obj.fs.readFileSync('private/web-cert-public.crt', 'utf8');
            webPrivateKey = obj.fs.readFileSync('private/web-cert-private.key', 'utf8');
            webCertAndKey = { cert: certoperation.pki.certificateFromPem(webCertificate), key: certoperation.pki.privateKeyFromPem(webPrivateKey) }
        } else {
            console.log('Generating Web certificate...');
            webCertAndKey = certoperation.IssueWebServerCertificate(rootCertAndKey, false, obj.config.commonName, obj.config.country, obj.config.organization, null, false);
            webCertificate = certoperation.pki.certificateToPem(webCertAndKey.cert);
            webPrivateKey = certoperation.pki.privateKeyToPem(webCertAndKey.key);
            obj.fs.writeFileSync('private/web-cert-public.crt', webCertificate);
            obj.fs.writeFileSync('private/web-cert-private.key', webPrivateKey);
        }
        certificates.web.cert = webCertificate;
        certificates.web.key = webPrivateKey;

        if (!obj.fs.existsSync('public/root.cer')) {
            var rootcert = certificates.root.cert;
            var i = rootcert.indexOf("-----BEGIN CERTIFICATE-----\r\n");
            if (i >= 0) { rootcert = rootcert.substring(i + 29); }
            i = rootcert.indexOf("-----END CERTIFICATE-----");
            if (i >= 0) { rootcert = rootcert.substring(i, 0); }
            obj.fs.writeFileSync('public/root.cer', Buffer.from(rootcert, 'base64'));
        }
        // create static folder
        // with basic authentication
        obj.app.use(basicAuth, obj.express.static(__dirname+'/public'), obj.serveindex(__dirname+'/public', {'icons': true}));
        // without basic authentication
        //obj.app.use(obj.express.static(__dirname+'/public'), obj.serveindex(__dirname+'/public', {'icons': true}));
        obj.http.createServer(obj.app).listen(80);
        console.log("HTTP server is listening at port 80");
        var options = {
            key: obj.fs.readFileSync('private/web-cert-private.key'),
            cert: obj.fs.readFileSync('private/web-cert-public.crt')
        };
        obj.https.createServer(options,obj.app).listen(443);
        console.log("HTTPS server is listening at port 443");
        console.log("Use Ctrl+C to terminate web server");
    }
    return obj;
}
// instantiate and start
CreateSimpleWebserver().Start();