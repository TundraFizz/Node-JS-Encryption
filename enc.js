var fs = require("fs");
var util = require("util");
var crypto = require("crypto");

function NodeEncryptor(){}

NodeEncryptor.prototype.GetFilesInDirectory = function(dir){
  var self = this;
  files = fs.readdirSync(dir);
  files.forEach(function(file){
    var full = dir + "/" + file;
    var stat = fs.statSync(full);
    if(stat.isFile() && file.substr(file.length-4, file.length) != ".enc"){ // Skip encoded files
      self.files.push(full);
    }else if(stat.isDirectory()){
      self.GetFilesInDirectory(full);
    }
  });
}

NodeEncryptor.prototype.Initialize = function(){return new Promise((resolve) => {
  var self = this;

  fs.readFile("enc.json", "utf8", function(err, data){
    var obj    = JSON.parse(data);
    self.alg   = obj["algorithm"];
    self.key   = obj["key"];
    self.paths = obj["paths"];
    self.files = [];

    // Get file metadata
    self.paths.forEach(function(file){
      try{
        var stat = fs.statSync(file);
        if(stat.isFile())
          self.files.push(__dirname + "/" + file);
        else if(stat.isDirectory())
          self.GetFilesInDirectory(__dirname + "/" + file);
      }catch(e){
        // Check if an encoded version exists
        try{
          var stat = fs.statSync(`${file}.enc`);
          if(stat.isFile())
            self.files.push(__dirname + "/" + file);
        }catch(e){
          console.log("Path not found:", file);
        }
      }
    });

    // Sort the array and remove duplicates
    self.files = self.files.sort();
    self.files = self.files.filter(function(elem, pos){
      return self.files.indexOf(elem) == pos;
    });

    self.metadata = {};
    self.files.forEach(function(file){
      self.metadata[file] = {};
      self.metadata[file]["dec"] = false;
      self.metadata[file]["enc"] = false;

      try{
        var stat = fs.statSync(file);
        if(stat.isFile())
          self.metadata[file]["dec"] = true;
      }catch(e){}

      try{
        var stat = fs.statSync(`${file}.enc`);
        if(stat.isFile())
          self.metadata[file]["enc"] = true;
      }catch(e){}
    });

    resolve();
  });
})}

NodeEncryptor.prototype.Run = function(option){
  var self = this;

  self.Initialize()
  .then(() => {
    if(option == "encrypt")
      self.Encrypt();
    else if(option == "decrypt")
      self.Decrypt();
    else
      console.log("Invalid option");
  });
}

NodeEncryptor.prototype.Encrypt = function(){
  var self = this;

  for(var i = 0; i < self.files.length; i++){
    var file = self.files[i];
    if(fs.existsSync(file)){
      var iv        = crypto.randomBytes(16);
      var cipher    = crypto.createCipheriv(self.alg, self.key, iv);
      var data      = fs.readFileSync(file);
      var encrypted = cipher.update(data, "utf8", "binary");
      encrypted    += cipher.final("binary");
      fs.writeFile(`${file}.enc`, iv.toString("hex") + encrypted);
      var relativePath = file.substr(__dirname.length+1, file.length);
      console.log(`File Encrypted: ${relativePath}`);
    }
  }
}

NodeEncryptor.prototype.Decrypt = function(){
  var self = this;

  for(var i = 0; i < self.files.length; i++){
    var file = self.files[i];
    if(fs.existsSync(`${file}.enc`)){
      var fileData  = fs.readFileSync(`${file}.enc`, "utf8");
      var utfIv     = fileData.substr(0, 32);
      var utfData   = fileData.substr(32);
      var iv        = new Buffer(utfIv, "hex");
      var cipher    = crypto.createDecipheriv(self.alg, self.key, iv);
      var decrypted = cipher.update(utfData, "binary", "utf8");
      decrypted    += cipher.final("utf8");
      fs.writeFile(file, decrypted);
      var relativePath = file.substr(__dirname.length+1, file.length);
      console.log(`File Decrypted: ${relativePath}.enc`);
    }
  }
}

function Main(){
  var arg = process.argv[2];
  if(typeof arg === undefined){
    console.log("Missing argument, use one of the below");
    console.log("encrypt | Encrypts files");
    console.log("e       | Same as encrypt");
    console.log("decrypt | Decrypts files");
    console.log("d       | Same as decrypt");
  }else if(arg == "encrypt" || arg == "e"){
    var nodeEncryptor = new NodeEncryptor();
    nodeEncryptor.Run("encrypt");
  }else if(arg == "decrypt" || arg == "d"){
    var nodeEncryptor = new NodeEncryptor();
    nodeEncryptor.Run("decrypt");
  }else{
    console.log("Invalid argument, use one of the below");
    console.log("encrypt | Encrypts files");
    console.log("e       | Same as encrypt");
    console.log("decrypt | Decrypts files");
    console.log("d       | Same as decrypt");
  }
}

Main();
