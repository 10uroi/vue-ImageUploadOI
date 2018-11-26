Vue.component("image-upload-oi", {
    template: `
        <div>
            <div style="border: 1px #DDD dotted;background-color: #eeeeee;"  @drop.prevent="dragdrop" @dragover.prevent>
             
                <div  style="border: 2px #000 dotted;width: 100%;padding-top: 10px;padding-bottom: 10px;cursor: pointer"align="center" onclick="document.getElementById('oi-image-input').click();"  >
                <span v-if="!loading"">Fotoğraf Ekle</span>
                <span v-if="loading"><img src="./assets/plugins/imageuploadoi/imageloading.gif" style="width: 23px"> Yükleniyor...</span>
                </div>
                <input type="file" id="oi-image-input" multiple style="display: none" @change="selectImage">
                <div style="padding: 10px;padding-top: 10px;padding-bottom: 10px" v-if="imagesm.length>0">
                
                    <span v-for="image in imagesm">
                        <span v-if="listtype==0">
                            <img :src="image" width="40px" style="margin: 5px;border: 1px #000 solid">
                            <img src="./assets/plugins/imageuploadoi/delete.svg" width="15px" style="position: inherit; margin-left:-15px;vertical-align: top;"  @click="deleteImage(image)">
                        </span>
                        <span v-if="listtype==1">
                            <img :src="image" width="130px" style="margin: 5px;border: 1px #000 solid">
                            <img src="./assets/plugins/imageuploadoi/delete.svg" width="15px" style="position: inherit; margin-left:-15px;vertical-align: top;margin-right: 0px"  @click="deleteImage(image)">
                        </span>
                    </span> 
                    <div style="font-size: 9px;margin-bottom: -10px;padding: 0px" align="right">{{uploadcount==undefined?'':'*Maksimum '+uploadcount+' fotoğraf yükleyebilirsiniz.'}}       
                    <span><img @click="changeList" style="width: 10px;cursor: pointer" title="Gösterim Değiştir" src="./assets/plugins/imageuploadoi/dashboard.png"></span>    </div>      
                
                </div> 
                
            </div> 
        
        </div>
    `,
    props:["uploadcount","images","type","resize"],
    data: function () {
        return {
            imagesm : [],
            loading : false,
            listtype : 0,
            maxsize  : 5000,//width and height için maksimum 5000 değerinde eğer 5000 üzerinde olursa herhangi bir fotonun px değerleri o zaman onu 5000'e indirecek.
        }
    },
    watch: {
        images : function(){
            if(this.images){
                this.imagesm = this.images;
            }
        }
    },
    methods: {
        imageToDataUri : function(imgs, maxWidth, maxHeight,callback) {

            if(maxWidth == -1){
                callback(imgs);
                return;
            }

            if(typeof(maxWidth) === 'undefined')  maxWidth = 5000;
            if(typeof(maxHeight) === 'undefined')  maxHeight = 5000;

            // Create and initialize two canvas
            var canvas = document.createElement("canvas");
            var ctx = canvas.getContext("2d");
            var canvasCopy = document.createElement("canvas");
            var copyContext = canvasCopy.getContext("2d");

            // Create original image
            var img = new Image();
            img.src = imgs;

            img.onload = function(e) {


                var ratio = 1;
                if(img.width > maxWidth)
                    ratio = maxWidth / img.width;
                else if(img.height > maxHeight)
                    ratio = maxHeight / img.height;

                // Draw original image in second canvas
                canvasCopy.width = img.width;
                canvasCopy.height = img.height;
                copyContext.drawImage(img, 0, 0);

                // Copy and resize second canvas to first canvas
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;
                ctx.drawImage(canvasCopy, 0, 0, canvasCopy.width, canvasCopy.height, 0, 0, canvas.width, canvas.height);

                callback(canvas.toDataURL());
            }

        },
        changeList : function () {
            this.listtype++;
            if(this.listtype > 1){
                this.listtype = 0;
            }
        },
        dragdrop : function (event) {
            for(var s=0;s<event.dataTransfer.files.length;s++){
                if(event.dataTransfer.files[s].size < 1){
                    alert("Bozuk bir dosya algılandı. Lütfen tekrar deneyiniz.");
                    return;
                }
            }
            if(!this.loading){
                var images = event.dataTransfer.files;
                this.getBase64(images,0);
            }
        },
        selectImage : function (value) {
            for(var s=0;s<value.target.files.length;s++){
                if(value.target.files[s].size < 1){
                    alert("Bozuk bir dosya algılandı. Lütfen tekrar deneyiniz.");
                    return;
                }
            }
            if(!this.loading){
                var images = value.target.files;
                this.getBase64(images,0);
            }
        },
        getBase64 : function(images,a) {

            if(images.length<1){
                return;
            }

            this.loading = true;

            if(images[a].type != undefined){
                if(!this.typeControl(images[a].type)){
                    var c = a;
                    c++;
                    if(c!=images.length)
                        this.getBase64(images,c);

                    this.loading = false;
                    return;
                }
            }

            var vm = this;
            var reader = new FileReader();
            reader.readAsDataURL(images[a]);
            reader.onload = function () {

                if(vm.resize ===undefined){
                    vm.resize = {width:vm.maxsize,height:vm.maxsize};
                }

                if(images[a].type == 'image/gif'){
                    console.log(images[a].type);
                    vm.resize = {width:-1,height:-1};
                }

                vm.imageToDataUri(reader.result,vm.resize.width,vm.resize.height,function (status) {

                    var bb = false;
                    for(var s=0;s<vm.imagesm.length;s++){
                        if(vm.imagesm[s] == status){
                            bb = true;
                        }
                        if(vm.imagesm.length>=vm.uploadcount){
                            bb = true;
                        }
                    }
                    if(!bb){
                        vm.imagesm.push(status);
                        vm.$emit("selectimage",vm.imagesm);
                    }
                    var c = a;
                    c++;
                    if(c!=images.length)
                        vm.getBase64(images,c);
                    else
                        vm.loading = false;
                });


            };
            reader.onerror = function (error) {
                console.log('Error: ', error);
                vm.loading = false;
            };


        },
        deleteImage : function (image) {
            for(var s=0;s<this.imagesm.length;s++){
                if(this.imagesm[s] == image){
                    this.imagesm.splice(s,1);

                    this.$emit("selectimage",this.imagesm);
                    return;
                }
            }

        },
        typeControl : function (type) {
            var status = false;
            if(this.type!=undefined){
                for(var a=0;a<this.type.length;a++){
                    if(this.type[a] == type){
                        return true;
                    }
                }
                return false;
            }
            return true;
        }
    },
    created(){
        if(this.images){
            this.imagesm = this.images;
        }


    }
});




//KULLANIM
/***********************************************************************************************************************
 * Onur Ciner - v.1.0 - ImageUploadOI
 *
 * Kullanım şekli
 *  <image-upload-oi :uploadcount="5" :images="images" @selectimage="imagelerim($event)" :type="imageType" :resize="resize" ></image-upload-oi>
 *
 *  -uploadcount = Maksimum eklenebilecek resim sayısıdır. Sınırsız için yazılmaması yeterlidir.
 *  -images = dışardan ekstra resim eklemek istersek. images = ["res1.jpg","res2.png"]
 *  -type = yüklenebilecek resim formatları belirlenir. imageType = ["image/png","image/jpg"]
 *  -selectimage = eklenen resimleri $event objesi içerisinden verir.
 *  -resize = width ve height'i orantılı olarak istediğiniz çözünürlük seviyesine kadar küçültür. resize : {width:10,height:10}
 *
 *
 ***********************************************************************************************************************/
