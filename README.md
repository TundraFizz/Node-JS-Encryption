# Node JS Encryption

![](https://img.shields.io/badge/Node.js-6.9-7fbd42.svg?style=plastic) ![](https://img.shields.io/badge/Status-Completed-008000.svg?style=plastic)

Usage
---
```node enc.js [arg]```

[arg] can be one of the following commands

```
encrypt   Encrypts files
e         Encrypts files
decrypt   Decrypts files
d         Decrypts files
```

enc.json
---
```key``` Change this to a random string that's 32 characters long
```algorithm``` Do not change this
```paths``` This is an array that can contain a mixture of individual files, and paths to directories

```
{
  "key": "zxcm;kef|jef>jldf&jgsl%riof#kljf",
  "algorithm": "aes-256-cbc",
  "paths": [
    "sample.txt"
  ]
}
```

Note: If you put a directory into paths, then it will include all files recusrively from that point.
