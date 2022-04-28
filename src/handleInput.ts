export class HandleInput{
    // attributes: string map, set map
    string_map = {}
    set_map = {}

    constructor() {
        // structure of json in local storage would be
        /*
            {
                "data":{
                    {
                        "string": {//key pair value},
                        "set":{//keypair value}
                    }
                },
                "snapshot":{ //similar content to data}
            }
        */
        if(localStorage.getItem('data')){
            let data = JSON.parse(localStorage.getItem('data'))
            // data previously saved on localstorage
            this.string_map = data["string"]
            this.set_map= data["set"]

            for (let key in this.set_map){
                this.set_map[key]["value"] = new Set(this.set_map[key].value);
            }
        }else{
            // create new 
            this.string_map = {}
            this.set_map = {}
        }
    }

    test_func(){
        console.log(this.string_map);
        console.log(this.set_map);
    }

    // methods:

    // save file -> write string map, set map to file
    save_file(){
        let list_map = {}
        for(const [key, val] of Object.entries(this.set_map)){
            if(val["value"] instanceof Set){
                list_map[key] = {
                    "value": Array.from(val["value"]),
                    "expire": val["expire"]
                };
            }
        }

        let data = {
            "string": this.string_map, 
            "set": list_map
        }
        localStorage.setItem("data", JSON.stringify(data));
    }

    // inputProcessing ->  get a string, split string to token and call correct method 
    inputProcessing(input){
        input = input.trim().toLowerCase();
        let input_tokens = input.split(" ");

        if(input_tokens.length >= 1){
            switch(input_tokens[0]){
                case "set":
                    return this.setString(input_tokens)
                case "get":
                    return this.getString(input_tokens)
                case "sadd":
                    return this.addSet(input_tokens)
                case "smembers":
                    return this.sMembers(input_tokens)
                case "srem":
                    return this.removeSetMem(input_tokens)
                case "sinter":
                    return this.sInter(input_tokens)
                case "keys":
                    return this.keys()
                case "del":
                    return this.delKeys(input_tokens)
                case "expire":
                    return this.expire(input_tokens)
                case "ttl":
                    return this.ttl(input_tokens)
                case "save":
                    return this.save()
                case "restore":
                    return this.restore()
                default:
                    throw `Command ${input_tokens[0]} not found`;
            }
        }
            
    }

    // set a string value, always overwriting what is saved under key
    setString(input_tokens){
        // check input format
        if(input_tokens.length != 3){
            throw "Expected format is 'SET key value' "
        }

        let key = input_tokens[1];
        if(this.string_map[key]){
            throw "Key already exist in set"
        }

        this.string_map[key] = {"value": input_tokens[2], "expire": -1};

        // write to local storage
        this.save_file();
        return `Key ${key} value ${input_tokens[2]} added successfully`
    }
    
    // get a string value at key
    getString(input_tokens){
        if(input_tokens.length!=2){
            throw "Expected format is 'GET key' "
        }

        let key = input_tokens[1];
        if(this.string_map[key]){
            return this.string_map[key].value;
        }

        throw `Key ${key} does not exists`
    }

    // add values to set stored at key
    addSet(input_tokens){
        if(input_tokens.length < 3){
            throw "Expected atleast 3 keywords in the format 'SADD key val1 val2 ...' "
        }

        let key = input_tokens[1];

        if(this.string_map[key]){
            throw "Key already exist as string"
        }
        
        if(this.set_map[key]){
            let added_val = input_tokens.slice(2)
            // if a set is created at key -> at to set
            for(const val of added_val){
                this.set_map[key]["value"].add(val);
            }
        }else{
            // else, create new set at key and add new values
            this.set_map[key] = {"value": new Set(), "expire":-1};
            let added_val = input_tokens.slice(2)

            for(const val of added_val){
                this.set_map[key]["value"].add(val);
            }
        }

        // update current state to localstorage
        this.save_file()

        return `Key ${key} value ${input_tokens.slice(2)} added successfully`
    }

    // remove values from set 
    removeSetMem(input_tokens){
        if(input_tokens.length < 3){
            throw "Expected atleast 3 keywords in the format 'SREM key val1 val2 ...' "
        }

        let key = input_tokens[1];
        let not_removed = [];

        // check if set already created
        if(this.set_map[key]){
            console.log(input_tokens.slice(2))
            for(const rem_val of input_tokens.slice(2)){
                console.log(rem_val)
                if(this.set_map[key]["value"].has(rem_val)){
                    this.set_map[key]["value"].delete(rem_val)
                }else{
                    not_removed.push(rem_val)
                }
            }
        }
        this.save_file();

        return `Values removed successfully${ not_removed.length > 0 && '. The following value does not exist: ' + not_removed}`
    }

    // return an array of all members of a set
    sMembers(input_tokens){
        if(input_tokens.length!=2){
            throw "Expected format is 'SMEMBERS key'"
        }

        let key = input_tokens[1];
        if(this.set_map[key]){
            return this.set_map[key]["value"];
        }

        throw "Key does not exist"
    }

    // set intersection among all set stored in specified keys. Return array of members of the result set 
    sInter(input_tokens){
        if(input_tokens.length < 3){
            throw "Expected atleast 3 keywords in the format 'SINTER key1 key2 ...' "
        }

        let val_count = new Map();
        for(const key of input_tokens.slice(1)){
            if(this.set_map[key]==null){
                throw `Key ${key} does not exist`
            }

            for(const val of this.set_map[key]["value"]){
                if(val_count.has(val)){
                    console.log("val ", val, "in key", key)
                    val_count.set(val, val_count.get(val)+1)
                }else{
                    val_count.set(val, 1)
                }
            }
        } 

        let intersect_list = [];
        for (const [key, val] of val_count.entries()) {
            if( parseInt(val) == Object.keys(this.set_map).length){
                intersect_list.push(key);
            }
        } 

        return intersect_list;
    }

    // list all keys
    keys(){
        let key_list = []
        for(const [key, val] of Object.entries(this.string_map)){
            key_list.push(key);
        }

        for(const [key, val] of Object.entries(this.set_map)){
            key_list.push(key);
        }

        return key_list;
    }

    // delete key
    delKeys(input_tokens){
        if (input_tokens.length != 2) {
            throw "Expected format is 'DEL key'"
        }

        let key = input_tokens[1]
        if(this.string_map[key]){
            delete this.string_map[key];
        }else if(this.set_map[key]){
            delete this.set_map[key];
        }else{
            throw `Key ${key} does not exist`
        }
        this.save_file()
        return `Key ${key} deleted successfully`
    }

    // expire key seconds
    expire(input_tokens){
        if (input_tokens.length != 3) {
            throw "Expected format is 'EXPIRE key seconds'"
        }

        let key = input_tokens[1];
        let time = input_tokens[2];

        // if time is not -1 or a positive integer
        if(time=='-1' || (Number.isInteger(Number(time)) && (Number(time)>0))){
            if(this.string_map[key]){
                this.string_map[key]["expire"] = time;
            }else if(this.set_map[key]){
                this.set_map[key]["expire"] = time;
            }else{
                throw "Key does not exists";
            }
            this.save_file()
            return `Expiration for ${key} is ${time}`
        }

        throw 'Time must be a positive integer or -1 (No expiration)'
        
    }

    // ttl
    ttl(input_tokens){
        if (input_tokens.length != 2) {
            throw "Expected format is 'TTL key'"
        }

        let key = input_tokens[1];

        if(this.string_map[key]){
            if(parseInt(this.string_map[key]["expire"])>0){
                return this.string_map[key]["expire"]
            }else{
                throw `Key ${key} does not have timeout`
            };
        }else if(this.set_map[key]){
            if(parseInt(this.set_map[key]["expire"])>0){
                return this.set_map[key]["expire"]
            }else{
                throw `Key ${key} does not have timeout`
            };
        }else{
            throw `Key ${key} does not exist`
        }
    }

    // helper function to reduce counter (expire) of keys with expiration
    counter_dec(){
        // loop through list of keys, check if expire time is available and decrease counter by 1
        // if expire is 0 -> delete key

        for (const key of this.keys()) {
            if(this.string_map[key] && this.string_map[key]["expire"] > 0){
                this.string_map[key]["expire"]-=1

                if(this.string_map[key]["expire"]==0){
                    delete this.string_map[key];
                }
            }else if(this.set_map[key] && this.set_map[key]["expire"] > 0){
                this.set_map[key]["expire"]-=1

                if(this.set_map[key]["expire"]==0){
                    delete this.set_map[key];
                }
            }
        }

        this.save_file()
    }

    // save snapshot
    save(){
        let list_map = {}
        for(const [key, val] of Object.entries(this.set_map)){
            if(val["value"] instanceof Set){
                list_map[key] = {
                    "value": Array.from(val["value"]),
                    "expire": val["expire"]
                };
            }
        }

        let snapshot = {
            "string": this.string_map, 
            "set": list_map
        }
        localStorage.setItem("snapshot", JSON.stringify(snapshot));

        return "A snapshot is created"
    }

    // restore from last snapshot
    restore(){
        if(localStorage.getItem('snapshot')){
            let data = JSON.parse(localStorage.getItem('snapshot'))
            // data previously saved on localstorage
            this.string_map = data["string"]
            this.set_map= data["set"]

            for (const key in this.set_map){
                this.set_map[key]["value"] = new Set(this.set_map[key]["value"]);
            }
        }else{
            throw "No snapshot found";
        }

        // save current state of data to local storage
        this.save_file();
        return "Data restored successfully"
    }

}