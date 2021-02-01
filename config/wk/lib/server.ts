const path = require('path');
const fs = require('fs');
const os = require('os');
const del = require('del');
const selfsigned = require('selfsigned');

function createCertificate(attributes) {
  return selfsigned.generate(attributes, {
    algorithm: 'sha256',
    days: 30,
    keySize: 2048,
    extensions: [
      // {
      //   name: 'basicConstraints',
      //   cA: true,
      // },
      {
        name: 'keyUsage',
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true,
      },
      {
        name: 'extKeyUsage',
        serverAuth: true,
        clientAuth: true,
        codeSigning: true,
        timeStamping: true,
      },
      {
        name: 'subjectAltName',
        altNames: [
          {
            // type 2 is DNS
            type: 2,
            value: 'localhost',
          },
          {
            type: 2,
            value: 'localhost.localdomain',
          },
          {
            type: 2,
            value: 'lvh.me',
          },
          {
            type: 2,
            value: '*.lvh.me',
          },
          {
            type: 2,
            value: '[::1]',
          },
          {
            // type 7 is IP
            type: 7,
            ip: '127.0.0.1',
          },
          {
            type: 7,
            ip: 'fe80::1',
          },
        ],
      },
    ],
  });
}

export function getCertificate(): string {
  // Use a self-signed certificate if no certificate was configured.
  // Cycle certs every 24 hours
  const certificateDir = os.tmpdir();
  const certificatePath = path.join(certificateDir, 'server.pem');

  let certificateExists = fs.existsSync(certificatePath);

  if (certificateExists) {
    const certificateTtl = 1000 * 60 * 60 * 24;
    const certificateStat = fs.statSync(certificatePath);

    const now = new Date().getTime();

    // cert is more than 30 days old, kill it with fire
    if ((now - certificateStat.ctime) / certificateTtl > 30) {
      console.log('SSL Certificate is more than 30 days old. Removing.');

      del.sync([certificatePath], { force: true });

      certificateExists = false;
    }
  }

  if (!certificateExists) {
    console.log('Generating SSL Certificate');

    const attributes = [{ name: 'commonName', value: 'localhost' }];
    const pems = createCertificate(attributes);

    fs.mkdirSync(certificateDir, { recursive: true });
    fs.writeFileSync(certificatePath, pems.private + pems.cert, {
      encoding: 'utf8',
    });
  }

  return fs.readFileSync(certificatePath);
}