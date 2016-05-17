/**************  File Manager Class **************/

/* <title File Manager>
   <toctitle FileManager Class>
   
   FileManager provides a simple interface for reading and
   writing text or json files.
   JavaScript Syntax
   * Writing a file *
   <code lang="javascript">
   var mgr = new FileManager('test.txt', 'json', air.File.applicationDirectory);
   mgr.data = 'Some text';
   mgr.save();
   
   </code>
   * Reading a file *
   <code lang="javascript">
   var mgr = new FileManager('test.txt', 'text', air.File.applicationDirectory);
   mgr.load();
   alert(mgr.data);
   </code>                                                                       */
function FileManager( file, format, dir ) {
        
        this.writeMode = air.FileMode.WRITE;
        this.format = (format) ? format : 'json';
        this.data = [];
        this.dir = dir;
        this.file = (dir) ? this.dir.resolvePath(file) : file;
        
        this.load = function() {
                
                if (!this.file.exists) {
                        this.data = [];
                        return;
                }
                
                var fs = new air.FileStream();
                fs.open( this.file, air.FileMode.READ);
                
                try {
                        
                        switch (this.format) {
                                case 'json' : 
                                        var d = fs.readUTFBytes(fs.bytesAvailable);
                                        fs.close();
                                        this.data = $.evalJSON(d);
                                break;
                                
                                case 'binary' :
                                        var b = new air.ByteArray();
                                        fs.readBytes(b, 0, fs.bytesAvailable);
                                        fs.close();
                                        this.data = b;
                                break;
                                default: 
                                        var d = fs.readUTFBytes(fs.bytesAvailable);
                                        fs.close();
                                        this.data = d; 
                                break;
                        }
                        
                } catch( ex ) {
                        throw 'Error loading: ' + this.file.name + ' ' + ex;
                }
        }
        
        this.save = function() {
        
                var fs = new air.FileStream();
                fs.open( this.file, this.writeMode );
                
                var payload = '';
                switch (this.format) {
                        
                        case 'json' : 
                                payload = $.toJSON(this.data);
                        break;
                        
                        default: payload = this.data; break;
                }
                
                fs.writeUTFBytes(payload);
                fs.close();
        }

        this.del = function() {
        
                if( this.file.exsits ) this.file.moveToTrash();

        }
 }


// Prompts the user w/ a FileOpen dialog, to browse
// for a media file (see list) and returns a byte
// array containing the contents of the image file.
//
// Accepted file types:
// mpg, mpeg, mov, mp4, png, jpg, jpeg, gif
//
// @callback - function to receive results
// @root - directory to start at
 FileManager.openMedia = function(root, callback, file_filter_string){
        
                // Set the root directory
                var img = (!root) ? air.File.userDirectory : root;
                
                // Set the file filter string
                var file_filter_string = (file_filter_string) ? file_filter_string : "*.mpg;*.mov;*.mpeg;*.mp4;*.png;*.jpg;*.jpeg;*.gif;";
                
                // Create the media file filter
                var img_filter = new air.FileFilter("Media", file_filter_string);
                
                // Prompt user to browse for file                       
                img.browseForOpen("Open", [img_filter]);
                
                // On Cancel
                img.addEventListener(air.Event.CANCEL, function(event){
                        if (typeof callback == 'function') 
                                callback({canceled: true, success: false, file: null, data: null });
                });
                
                // On Selected
                img.addEventListener(air.Event.SELECT, function(event){
                
                        // Convert file size to mega bytes
                        var file_size = (img.size / 1024) / 1024;
                        // Prepare the response object
                        var response = { canceled: false, success: true, error: false, size: file_size, file: img };
                                
                        // Call the callback
                        if (typeof callback == 'function') 
                                callback(response);
                });
        }