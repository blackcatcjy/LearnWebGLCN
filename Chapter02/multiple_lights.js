var COLOR_VSHADER_SOURCE =
  "attribute vec4 a_Position;\n" +
  'attribute vec3 a_Normal;\n' +
  'attribute vec2 a_TexCoord;\n' +
  "uniform mat4 u_MvpMatrix;\n" +
  "uniform mat4 u_ModelMatrix;\n" +
  "uniform mat4 u_NormalMatrix;\n" +
  "varying vec3 v_Normal;\n" +
  "varying vec3 v_FragPos;\n" + 
  "varying vec2 v_TexCoord;\n" + 
  "void main() {\n" +
  "  gl_Position = u_MvpMatrix * a_Position;\n" +
  "  v_Normal = (u_NormalMatrix * vec4(a_Normal,1.0)).xyz;\n" +
  "  v_TexCoord = a_TexCoord;\n" +
  "  v_FragPos = (u_ModelMatrix * a_Position).xyz;\n" +
  "}\n";

// Fragment shader program
var COLOR_FSHADER_SOURCE =
  "#ifdef GL_ES\n" +
  "precision mediump float;\n" +
  "#endif\n" +
  "struct Material {\n" +
  "  sampler2D diffuse;\n" +
  "  sampler2D specular;\n" +
  "  float shininess;\n" +
  "};\n" +

  "struct DirLight  {\n" +
  "  vec3 direction;\n" +

  "  vec3 ambient;\n" +
  "  vec3 diffuse;\n" +
  "  vec3 specular;\n" +

  "};\n" +

  "struct PointLight   {\n" +
  "  vec3 position;\n" +

  "  vec3 ambient;\n" +
  "  vec3 diffuse;\n" +
  "  vec3 specular;\n" +

  "  float constant;\n" +  
  "  float linear;\n" +  
  "  float quadratic;\n" +  
  "};\n" +


  "struct SpotLight{\n" +
  "  vec3 position;\n" +
  "  vec3 direction;\n" +
  "  float cutOff;\n" +
  "  float outerCutOff;\n" +

  "  vec3 ambient;\n" +
  "  vec3 diffuse;\n" +
  "  vec3 specular;\n" +

  "  float constant;\n" +  
  "  float linear;\n" +  
  "  float quadratic;\n" +  
  "};\n" +


  "#define NR_POINT_LIGHTS 4 \n"+
  "uniform Material u_Material;\n" +
  "uniform vec3 u_ViewPos;\n" +
  "varying vec3 v_Normal;\n" +
  "varying vec3 v_FragPos;\n" + 
  "varying vec2 v_TexCoord;\n" + 

  "uniform DirLight u_DirLight;\n" + 
  "uniform PointLight u_PointLights[NR_POINT_LIGHTS];\n" + 
  "uniform SpotLight u_SpotLight;\n" + 

  // function prototypes
  "vec3 CalcDirLight(DirLight light, vec3 normal, vec3 viewDir){\n" +
  "  vec3 lightDir = normalize(-light.direction);\n" +
  // diffuse shading
  "  float diff = max(dot(normal, lightDir), 0.0);\n" +
  // specular shading
  "  vec3 reflectDir = reflect(-lightDir, normal);\n" +
  "  float spec = pow(max(dot(viewDir, reflectDir), 0.0), u_Material.shininess);\n" +
  // combine results
  "  vec3 ambient = light.ambient * vec3(texture2D(u_Material.diffuse, v_TexCoord));\n" +
  "  vec3 diffuse = light.diffuse * diff * vec3(texture2D(u_Material.diffuse, v_TexCoord));\n" +
  "  vec3 specular = light.specular * spec * vec3(texture2D(u_Material.specular, v_TexCoord));\n" +
  "  return (ambient + diffuse + specular);\n" +
  "}\n" + 

  "vec3 CalcSpotLight(SpotLight light, vec3 normal, vec3 fragPos, vec3 viewDir){ \n"+
  "  vec3 lightDir = normalize(light.position - fragPos);\n"+
  // diffuse shading
  "  float diff = max(dot(normal, lightDir), 0.0);\n"+
  // specular shading
  "  vec3 reflectDir = reflect(-lightDir, normal);\n"+
  "  float spec = pow(max(dot(viewDir, reflectDir), 0.0), u_Material.shininess);\n"+
  // attenuation
  "  float distance = length(light.position - fragPos);\n"+
  "  float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance));    \n"+
  // spotlight intensity
  "  float theta = dot(lightDir, normalize(-light.direction)); \n"+
  "  float epsilon = light.cutOff - light.outerCutOff;\n"+
  "  float intensity = clamp((theta - light.outerCutOff) / epsilon, 0.0, 1.0); \n"+
  // combine results
  "  vec3 ambient = light.ambient * vec3(texture2D(u_Material.diffuse, v_TexCoord));\n"+
  "  vec3 diffuse = light.diffuse * diff * vec3(texture2D(u_Material.diffuse, v_TexCoord));\n"+
  "  vec3 specular = light.specular * spec * vec3(texture2D(u_Material.specular, v_TexCoord));\n"+
  "  ambient *= attenuation * intensity;\n"+
  "  diffuse *= attenuation * intensity;\n"+
  "  specular *= attenuation * intensity;\n"+
  "  return (ambient + diffuse + specular);\n"+
  "}\n" + 

  "vec3 CalcPointLight(PointLight light, vec3 normal, vec3 fragPos, vec3 viewDir)\n"+
  "{\n"+
  "  vec3 lightDir = normalize(light.position - fragPos);\n"+
  // diffuse shading
  "  float diff = max(dot(normal, lightDir), 0.0);\n"+
    // specular shading
  "  vec3 reflectDir = reflect(-lightDir, normal);\n"+
  "  float spec = pow(max(dot(viewDir, reflectDir), 0.0), u_Material.shininess);\n"+
    // attenuation
  "  float distance = length(light.position - fragPos);\n"+
  "  float attenuation = 1.0 / (light.constant + light.linear * distance + light.quadratic * (distance * distance)); \n"+   
    // combine results
  "  vec3 ambient = light.ambient * vec3(texture2D(u_Material.diffuse, v_TexCoord));\n"+
  "  vec3 diffuse = light.diffuse * diff * vec3(texture2D(u_Material.diffuse, v_TexCoord));\n"+
  "  vec3 specular = light.specular * spec * vec3(texture2D(u_Material.specular, v_TexCoord));\n"+
  "  ambient *= attenuation;\n"+
  "  diffuse *= attenuation;\n"+
  "  specular *= attenuation;\n"+
  "  return (ambient + diffuse + specular);\n"+
  "}\n"+

 "void main()\n" +
 "{\n" +
     // properties
    "vec3 norm = normalize(v_Normal);\n" + 
    "vec3 viewDir = normalize(u_ViewPos - v_FragPos);\n" +
    // == =====================================================
    // Our lighting is set up in 3 phases: directional, point lights and an optional flashlight
    // For each phase, a calculate function is defined that calculates the corresponding color
    // per lamp. In the main() function we take all the calculated colors and sum them up for
    // this fragment's final color.
    // == =====================================================
    // phase 1: directional lighting
    "vec3 result = CalcDirLight(u_DirLight, norm, viewDir);\n" +
    // phase 2: point lights
    "for(int i = 0; i < NR_POINT_LIGHTS; i++)\n" +
    "    result += CalcPointLight(u_PointLights[i], norm, v_FragPos, viewDir);\n" +    
    // phase 3: spot light
    "result += CalcSpotLight(u_SpotLight, norm, v_FragPos, viewDir);\n" +    
    "gl_FragColor = vec4(result, 1.0);\n" +
  "}\n"; 

var LAMP_VSHADER_SOURCE =
  "attribute vec4 a_Position;\n" +
  "uniform mat4 u_MvpMatrix;\n" +
  "void main() {\n" +
  "  gl_Position = u_MvpMatrix * a_Position;\n" +
  "}\n";

var LAMP_FSHADER_SOURCE =
  "#ifdef GL_ES\n" +
  "precision mediump float;\n" +
  "#endif\n" +
  "uniform vec4 u_LightColor;\n" +
  "void main() {\n" +
  "  gl_FragColor = u_LightColor;\n" +
  "}\n";

var g_last = Date.now();
var ANGLE_STEP = 45.0;

var offset_Fov = 0.0;
function mousewhellFun(ev){
  if(ev.wheelDelta > 0)
      offset_Fov += 1;
  if(ev.wheelDelta <0 )
      offset_Fov -= 1;
}


var offset_EyeX = 0;
var offset_EyeY = 0;
var offset_EyeZ = 3;
var offset_LightX = 0;
var offset_LightY = 0;
var offset_LightZ = 3;
var offset_LookAtX = 0.0;
var offset_LookAtY = 0.0;
var offset_LookAtZ = 0.0;
function keydownFun(ev){
  if(ev.keyCode == 87)
      offset_EyeZ -= 0.05;
  if(ev.keyCode == 83)
      offset_EyeZ += 0.05;
  if(ev.keyCode == 68)
      offset_EyeX += 0.05;
  if(ev.keyCode == 65)
      offset_EyeX -= 0.05;
}

var last_MousePosX;
var last_MousePosY;

var g_TexFrag1 = false , g_TexFrag2 = false;


function mousedownFun(ev){
  last_MousePosX = ev.clientX;
  last_MousePosY = ev.clientY;
}

var vec_Front = [0.0, 0.0 , -1];

function radians(angle){
    return angle * Math.PI / 180.0;
}

function mousemoveFun(ev){
    if(ev.buttons != 1 && ev.buttons != 4){
        return;
    }

    var cur_MousePosX = ev.clientX;
    var cur_MousePosY = ev.clientY;

    if(ev.buttons == 1)
    {
        offset_EyeX += -0.05 * (cur_MousePosX - last_MousePosX);
        offset_EyeY += -0.05 * (last_MousePosY - cur_MousePosY);
        offset_LookAtX += -0.05 * (cur_MousePosX - last_MousePosX);
        offset_LookAtY += -0.05 * (last_MousePosY - cur_MousePosY);
    }

    if(ev.buttons == 4){
      offset_EyeX += -0.05 * (cur_MousePosX - last_MousePosX);
      offset_EyeY += -0.05 * (last_MousePosY - cur_MousePosY);
     }

    last_MousePosX = cur_MousePosX;
    last_MousePosY = cur_MousePosY;
}

function eventMouseOver()
{
    document.addEventListener('mousewheel', mousewhellFun);
    document.addEventListener('keydown', keydownFun);
    document.addEventListener('mousedown',mousedownFun);
    document.addEventListener('mousemove',mousemoveFun);
}

function eventMouseOut()
{
    document.removeEventListener('mousewheel',mousewhellFun);
    document.removeEventListener('keydown', keydownFun);
    document.removeEventListener('mousedown',mousedownFun);
    document.removeEventListener('mousemove',mousemoveFun);
}




function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById("webgl");

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log("Failed to get the rendering context for WebGL");
    return;
  }

  //Create shaders
  var colorProgram = createProgram(
    gl,
    COLOR_VSHADER_SOURCE,
    COLOR_FSHADER_SOURCE
  );

  var lampProgram = createProgram(
    gl,
    LAMP_VSHADER_SOURCE,
    LAMP_FSHADER_SOURCE
  );

  var vertices  = new Float32Array([
    -0.5, -0.5, -0.5,  0.0,  0.0, -1.0,  0.0,  0.0,
    0.5, -0.5, -0.5,  0.0,  0.0, -1.0,  1.0,  0.0,
    0.5,  0.5, -0.5,  0.0,  0.0, -1.0,  1.0,  1.0,
    0.5,  0.5, -0.5,  0.0,  0.0, -1.0,  1.0,  1.0,
   -0.5,  0.5, -0.5,  0.0,  0.0, -1.0,  0.0,  1.0,
   -0.5, -0.5, -0.5,  0.0,  0.0, -1.0,  0.0,  0.0,

   -0.5, -0.5,  0.5,  0.0,  0.0,  1.0,  0.0,  0.0,
    0.5, -0.5,  0.5,  0.0,  0.0,  1.0,  1.0,  0.0,
    0.5,  0.5,  0.5,  0.0,  0.0,  1.0,  1.0,  1.0,
    0.5,  0.5,  0.5,  0.0,  0.0,  1.0,  1.0,  1.0,
   -0.5,  0.5,  0.5,  0.0,  0.0,  1.0,  0.0,  1.0,
   -0.5, -0.5,  0.5,  0.0,  0.0,  1.0,  0.0,  0.0,

   -0.5,  0.5,  0.5, -1.0,  0.0,  0.0,  1.0,  0.0,
   -0.5,  0.5, -0.5, -1.0,  0.0,  0.0,  1.0,  1.0,
   -0.5, -0.5, -0.5, -1.0,  0.0,  0.0,  0.0,  1.0,
   -0.5, -0.5, -0.5, -1.0,  0.0,  0.0,  0.0,  1.0,
   -0.5, -0.5,  0.5, -1.0,  0.0,  0.0,  0.0,  0.0,
   -0.5,  0.5,  0.5, -1.0,  0.0,  0.0,  1.0,  0.0,

    0.5,  0.5,  0.5,  1.0,  0.0,  0.0,  1.0,  0.0,
    0.5,  0.5, -0.5,  1.0,  0.0,  0.0,  1.0,  1.0,
    0.5, -0.5, -0.5,  1.0,  0.0,  0.0,  0.0,  1.0,
    0.5, -0.5, -0.5,  1.0,  0.0,  0.0,  0.0,  1.0,
    0.5, -0.5,  0.5,  1.0,  0.0,  0.0,  0.0,  0.0,
    0.5,  0.5,  0.5,  1.0,  0.0,  0.0,  1.0,  0.0,

   -0.5, -0.5, -0.5,  0.0, -1.0,  0.0,  0.0,  1.0,
    0.5, -0.5, -0.5,  0.0, -1.0,  0.0,  1.0,  1.0,
    0.5, -0.5,  0.5,  0.0, -1.0,  0.0,  1.0,  0.0,
    0.5, -0.5,  0.5,  0.0, -1.0,  0.0,  1.0,  0.0,
   -0.5, -0.5,  0.5,  0.0, -1.0,  0.0,  0.0,  0.0,
   -0.5, -0.5, -0.5,  0.0, -1.0,  0.0,  0.0,  1.0,

   -0.5,  0.5, -0.5,  0.0,  1.0,  0.0,  0.0,  1.0,
    0.5,  0.5, -0.5,  0.0,  1.0,  0.0,  1.0,  1.0,
    0.5,  0.5,  0.5,  0.0,  1.0,  0.0,  1.0,  0.0,
    0.5,  0.5,  0.5,  0.0,  1.0,  0.0,  1.0,  0.0,
   -0.5,  0.5,  0.5,  0.0,  1.0,  0.0,  0.0,  0.0,
   -0.5,  0.5, -0.5,  0.0,  1.0,  0.0,  0.0,  1.0
  ]);



  //使用colorProgram
  gl.useProgram(colorProgram);
  gl.program = colorProgram;

  // Write the positions , normal of vertices to a vertex shader
  var n = initVertexBuffers(gl , vertices , true , true);
  if (n < 0) {
    console.log("Failed to set the positions of the vertices");
    return;
  }

  if(initTextures(gl,n) ==false)
  {
      console.log("Failed to set the texture2D of the vertices");
      return;
  }

  gl.useProgram(lampProgram);
  gl.program = lampProgram;
  // Write the positions  of vertices to a vertex shader
  n = initVertexBuffers(gl ,vertices,false,false);
  if (n < 0) {
    console.log("Failed to set the positions of the vertices");
    return;
  }

 
  var currentAngle = 0.0;
  var tick = function() {
    currentAngle = animate(currentAngle); // Update the rotation angle
    draw(gl ,canvas ,n , currentAngle , colorProgram , lampProgram); // Draw the triangle
    requestAnimationFrame(tick, canvas); // Request that the browser ?calls tick
  };
  tick();
}



function initVertexBuffers(gl , vertices , hasNormal ,hasTexCoord) {


  var n = 36; // The number of vertices

  // Create a buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log("Failed to create the buffer object");
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var a_Position = gl.getAttribLocation(gl.program, "a_Position");
  if (a_Position < 0) {
    console.log("Failed to get the storage location of a_Position");
    return -1;
  }

  // Assign the buffer object to a_Position variable
  var FSIZE = vertices.BYTES_PER_ELEMENT;
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 8, 0);

  // Enable the assignment to a_Position variable
  gl.enableVertexAttribArray(a_Position);

  if(hasNormal == true){
    var a_Normal = gl.getAttribLocation(gl.program , "a_Normal");
    if(a_Normal < 0){
        console.log("Failed to get the storage location of a_Normal");
        return  -1;
    }
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, FSIZE * 8, FSIZE * 3);
    gl.enableVertexAttribArray(a_Normal);
  }

  if(hasTexCoord == true){
    var a_TexCoord = gl.getAttribLocation(gl.program , "a_TexCoord");
    if(a_TexCoord < 0){
        console.log("Failed to get the storage location of a_TexCoord");
        return  -1;
    }
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 8, FSIZE * 6);
    gl.enableVertexAttribArray(a_TexCoord);
  }

  return n;
}



function initTextures(gl, n) {
    var texture1 = gl.createTexture();   // Create a texture2D object
    var texture2 = gl.createTexture();
    if (!texture1 || !texture2) {
      console.log('Failed to create the texture2D object');
      return false;
    }
  
    // Get the storage location of u_Sampler
    var u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Material.diffuse');
    var u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Material.specular');
  
    if (!u_Sampler1 || !u_Sampler2) {
      console.log('Failed to get the storage location of u_Sampler1 Or u_Sampler2');
      return false;
    }
    var image1 = new Image();  // Create the jpg image object
    var image2 = new Image();  // Create the png image object
    if (!image1 || !image2) {
      console.log('Failed to create the image object');
      return false;
    }
  
    image1.onload = function(){ loadTexture(gl, n, texture1, texture2 ,  u_Sampler1 , u_Sampler2, image1 , image2); };
    image1.src = '../Data/container2.png';
  
    image2.onload = function(){ loadTexture(gl, n, texture1, texture2 ,  u_Sampler1 , u_Sampler2, image1 , image2); };
    image2.src = '../Data/container2_specular.png';
    return true;
  }


  function loadTexture(gl, n, texture1, texture2, u_Sampler1, u_Sampler2, image1, image2 ) {
    if(!image1.complete || !image2.complete)
      return;

  
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture2D unit0
    gl.activeTexture(gl.TEXTURE0);
    // Bind the texture2D object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture1);
  
  
    // set texture2D wrapping to GL_REPEAT (default wrapping method)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);	
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  
    // Set the texture2D parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // Set the texture2D image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image1);
    
    // Set the texture2D unit 0 to the sampler
    gl.uniform1i(u_Sampler1, 0);
  
    //Enable texture2D unit1
    gl.activeTexture(gl.TEXTURE1);
    // Bind the texture2D object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture2);
  
    // set texture2D wrapping to GL_REPEAT (default wrapping method)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);	
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  
    // Set the texture2D parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  
    // Set the texture2D image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image2);
    // Set the texture2D unit 1 to the sampler
    gl.uniform1i(u_Sampler2, 1);
  }
  



var g_last = Date.now();
function animate(angle) {
  // Calculate the elapsed time
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  // Update the current rotation angle (adjusted by the elapsed time)
  var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
  return newAngle %= 360;
}

function draw(gl ,canvas ,n,currentAngle, colorProgram , lampProgram){

    // Specify the color for clearing <canvas>
    gl.clearColor(0.1, 0.1, 0.1, 1);
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    gl.useProgram(colorProgram);
    gl.program = colorProgram;
    var d = new Date();
    var radian = (currentAngle * Math.PI / 180.0);
    var lightColorx = Math.sin(radian  * 2.0);
    var lightColory = Math.sin(radian * 0.7);
    var lightColorz = Math.sin(radian * 1.3);

    

    var pointLightPositions =new Float32Array([
        0.7,  0.2,  2.0,
        2.3, -3.3, -4.0,
       -4.0,  2.0, -12.0,
        0.0,  0.0, -3.0
   ]);


   //directional light
   var u_DirLightDirection = gl.getUniformLocation(gl.program, "u_DirLight.direction");
   gl.uniform1f(u_DirLightDirection ,  -0.2, -1.0, -0.3);

   var u_DirLightAmbient = gl.getUniformLocation(gl.program, "u_DirLight.ambient");
   gl.uniform1f(u_DirLightAmbient , 0.05, 0.05,0.05);   

   var u_DirLightDiffuse = gl.getUniformLocation(gl.program, "u_DirLight.diffuse");
   gl.uniform1f(u_DirLightDiffuse , 0.4, 0.4, 0.4);
   
   var u_DirLightSpecular = gl.getUniformLocation(gl.program, "u_DirLight.specular");
   gl.uniform1f(u_DirLightSpecular , 0.5, 0.5, 0.5);


   // point light 1
   var u_PointLightsPosition = gl.getUniformLocation(gl.program, "u_PointLights[0].position");
   gl.uniform3f(u_PointLightsPosition , 
    pointLightPositions[0], 
    pointLightPositions[1], 
    pointLightPositions[2]);
   var u_PointLightsAmbient = gl.getUniformLocation(gl.program,"u_PointLights[0].ambient");
   gl.uniform3f(u_PointLightsAmbient , 0.05, 0.05, 0.05);
   var u_PointLightsDiffuse = gl.getUniformLocation(gl.program,"u_PointLights[0].diffuse");
   gl.uniform3f(u_PointLightsDiffuse , 0.8, 0.8, 0.8);
   var u_PointLightsSpecular = gl.getUniformLocation(gl.program,"u_PointLights[0].specular");
   gl.uniform3f(u_PointLightsSpecular , 1, 1, 1);
   var u_PointLightsConstant = gl.getUniformLocation(gl.program,"u_PointLights[0].constant");
   gl.uniform1f(u_PointLightsConstant , 1);
   var u_PointLightsLinear = gl.getUniformLocation(gl.program,"u_PointLights[0].linear");   
   gl.uniform1f(u_PointLightsLinear , 0.9);
   var u_PointLightsQuadratic = gl.getUniformLocation(gl.program,"u_PointLights[0].quadratic");   
   gl.uniform1f(u_PointLightsQuadratic , 0.032);


      // point light 2
    var u_PointLightsPosition = gl.getUniformLocation(gl.program, "u_PointLights[1].position");
    gl.uniform3f(u_PointLightsPosition , 
      pointLightPositions[3], 
      pointLightPositions[4], 
      pointLightPositions[5]);
    var u_PointLightsAmbient = gl.getUniformLocation(gl.program,"u_PointLights[1].ambient");
    gl.uniform3f(u_PointLightsAmbient , 0.05, 0.05, 0.05);
    var u_PointLightsDiffuse = gl.getUniformLocation(gl.program,"u_PointLights[1].diffuse");
    gl.uniform3f(u_PointLightsDiffuse , 0.8, 0.8, 0.8);
    var u_PointLightsSpecular = gl.getUniformLocation(gl.program,"u_PointLights[1].specular");
    gl.uniform3f(u_PointLightsSpecular , 1, 1, 1);
    var u_PointLightsConstant = gl.getUniformLocation(gl.program,"u_PointLights[1].constant");
    gl.uniform1f(u_PointLightsConstant , 1);
    var u_PointLightsLinear = gl.getUniformLocation(gl.program,"u_PointLights[1].linear");   
    gl.uniform1f(u_PointLightsLinear , 0.9);
    var u_PointLightsQuadratic = gl.getUniformLocation(gl.program,"u_PointLights[1].quadratic");   
    gl.uniform1f(u_PointLightsQuadratic , 0.032);
    
    // point light 3
    var u_PointLightsPosition = gl.getUniformLocation(gl.program, "u_PointLights[2].position");
    gl.uniform3f(u_PointLightsPosition , 
      pointLightPositions[6], 
      pointLightPositions[7], 
      pointLightPositions[8]);
    var u_PointLightsAmbient = gl.getUniformLocation(gl.program,"u_PointLights[2].ambient");
    gl.uniform3f(u_PointLightsAmbient , 0.05, 0.05, 0.05);
    var u_PointLightsDiffuse = gl.getUniformLocation(gl.program,"u_PointLights[2].diffuse");
    gl.uniform3f(u_PointLightsDiffuse , 0.8, 0.8, 0.8);
    var u_PointLightsSpecular = gl.getUniformLocation(gl.program,"u_PointLights[2].specular");
    gl.uniform3f(u_PointLightsSpecular , 1, 1, 1);
    var u_PointLightsConstant = gl.getUniformLocation(gl.program,"u_PointLights[2].constant");
    gl.uniform1f(u_PointLightsConstant , 1);
    var u_PointLightsLinear = gl.getUniformLocation(gl.program,"u_PointLights[2].linear");   
    gl.uniform1f(u_PointLightsLinear , 0.9);
    var u_PointLightsQuadratic = gl.getUniformLocation(gl.program,"u_PointLights[2].quadratic");   
    gl.uniform1f(u_PointLightsQuadratic , 0.032);

    // point light 4
    var u_PointLightsPosition = gl.getUniformLocation(gl.program, "u_PointLights[3].position");
    gl.uniform3f(u_PointLightsPosition , 
      pointLightPositions[9], 
      pointLightPositions[10], 
      pointLightPositions[11]);
    var u_PointLightsAmbient = gl.getUniformLocation(gl.program,"u_PointLights[3].ambient");
    gl.uniform3f(u_PointLightsAmbient , 0.05, 0.05, 0.05);
    var u_PointLightsDiffuse = gl.getUniformLocation(gl.program,"u_PointLights[3].diffuse");
    gl.uniform3f(u_PointLightsDiffuse , 0.8, 0.8, 0.8);
    var u_PointLightsSpecular = gl.getUniformLocation(gl.program,"u_PointLights[3].specular");
    gl.uniform3f(u_PointLightsSpecular , 1, 1, 1);
    var u_PointLightsConstant = gl.getUniformLocation(gl.program,"u_PointLights[3].constant");
    gl.uniform1f(u_PointLightsConstant , 1);
    var u_PointLightsLinear = gl.getUniformLocation(gl.program,"u_PointLights[3].linear");   
    gl.uniform1f(u_PointLightsLinear , 0.9);
    var u_PointLightsQuadratic = gl.getUniformLocation(gl.program,"u_PointLights[3].quadratic");   
    gl.uniform1f(u_PointLightsQuadratic , 0.032);


    // spotLight
   var u_SpotLightPosition = gl.getUniformLocation(gl.program, "u_SpotLight.position");
   gl.uniform3f(u_SpotLightPosition , 0, 0, 3);
   var u_SpotLightDirection = gl.getUniformLocation(gl.program, "u_SpotLight.direction");
   gl.uniform3f(u_SpotLightDirection , 0, 0, -1);
   var u_SpotLightAmbient = gl.getUniformLocation(gl.program, "u_SpotLight.ambient");
   gl.uniform3f(u_SpotLightAmbient , 0, 0, 0);
   var u_SpotLightDiffuse = gl.getUniformLocation(gl.program, "u_SpotLight.diffuse");
   gl.uniform3f(u_SpotLightDiffuse , 1, 1, 1);
   var u_SpotLightSpecular = gl.getUniformLocation(gl.program, "u_SpotLight.specular");   
   gl.uniform3f(u_SpotLightSpecular , 1, 1, 1);
   var u_SpotLightConstant = gl.getUniformLocation(gl.program,"u_SpotLight.constant");
   gl.uniform1f(u_SpotLightConstant , 1);
   var u_SpotLightLinear = gl.getUniformLocation(gl.program,"u_SpotLight.linear");    
   gl.uniform1f(u_SpotLightLinear , 0.09);
   var u_SpotLightQuadratic = gl.getUniformLocation(gl.program,"u_SpotLight.quadratic");       
   gl.uniform1f(u_SpotLightQuadratic , 0.032);
   var u_SpotLightCutOff = gl.getUniformLocation(gl.program,"u_SpotLight.cutOff");       
   gl.uniform1f(u_SpotLightCutOff , Math.cos(radians(25)));
   var u_SpotLightOuterCutOff = gl.getUniformLocation(gl.program,"u_SpotLight.outerCutOff");       
   gl.uniform1f(u_SpotLightOuterCutOff , Math.cos(radians(35)));

   

   var u_ViewPos = gl.getUniformLocation(gl.program, "u_ViewPos");
    // console.log("u_ViewPos:" ,u_ViewPos);
    gl.uniform3f(u_ViewPos,  2.3, -3.3, -4.0,);

    var colorModelMatrix = new Matrix4();
    var lampModelMatrix = new Matrix4();
    var viewMatrix = new Matrix4();
    var prespectiveMatrix = new Matrix4();
    var colorMvpMatrix = new Matrix4();
    var lampMvpMatrix = new Matrix4();
    var normalMatrix = new Matrix4();
  

    var cubePositions =new Float32Array([
        0.0,  0.0,  0.0,
        11.0,  -1.0,  0.0,        
        2.0,  5.0, -15.0,
        -1.5, -2.2, -2.5,
        -3.8, -2.0, -12.3,
        2.4, -0.4, -3.5,
        -1.7,  3.0, -7.5,
        1.3, -2.0, -2.5,
        1.5,  2.0, -2.5,
        1.5,  0.2, -1.5,
        -1.3,  1.0, -1.5
    ]);




    viewMatrix.setLookAt( offset_EyeX, offset_EyeY, offset_EyeZ, offset_LookAtX, offset_LookAtY, offset_LookAtZ, 0, 1, 0);
    prespectiveMatrix.setPerspective(45.0 + offset_Fov, canvas.width / canvas.height, 1, 100);


    var u_MaterialShininess = gl.getUniformLocation(gl.program, "u_Material.shininess");
    gl.uniform1f(u_MaterialShininess, 32.0);
  

    for(var i = 0 ; i < 9 ; i++){
        colorModelMatrix.setTranslate(cubePositions[i * 3] , 
            cubePositions[i * 3 + 1],
            cubePositions[i * 3 + 2]);
        colorModelMatrix.rotate(currentAngle, 0.5, 1.0, 0.0);
        colorMvpMatrix
            .set(prespectiveMatrix)
            .multiply(viewMatrix)
            .multiply(colorModelMatrix);
        var u_MvpMatrix = gl.getUniformLocation(gl.program, "u_MvpMatrix");
        gl.uniformMatrix4fv(u_MvpMatrix, false, colorMvpMatrix.elements);

        var u_ModelMatrix = gl.getUniformLocation(gl.program , "u_ModelMatrix");
        gl.uniformMatrix4fv(u_ModelMatrix, false, colorModelMatrix.elements);

        var rotateMatrix = new Matrix4();
        rotateMatrix.setRotate(currentAngle, 0.5, 1.0, 0.0);
        normalMatrix.setInverseOf(rotateMatrix);
        normalMatrix.transpose();

        var u_NormalMatrix = gl.getUniformLocation(gl.program ,"u_NormalMatrix");
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

        gl.drawArrays(gl.TRIANGLES, 0, n);
    }
    gl.useProgram(lampProgram);
    gl.program = lampProgram;




    var u_LightColor = gl.getUniformLocation(gl.program, "u_LightColor");
    gl.uniform4f(u_LightColor, 1.0, 1, 1, 1);
    for(var i = 0 ; i < 4 ; i++){
        lampModelMatrix.setTranslate(pointLightPositions[ i * 3], 
        pointLightPositions[i * 3 + 1],
        pointLightPositions[i * 3 + 2],);
        lampModelMatrix.scale(0.2, 0.2, 0.2);
        lampMvpMatrix
          .set(prespectiveMatrix)
          .multiply(viewMatrix)
          .multiply(lampModelMatrix);
    
        var u_LampMvpMatrix = gl.getUniformLocation(gl.program, "u_MvpMatrix");
        gl.uniformMatrix4fv(u_LampMvpMatrix, false, lampMvpMatrix.elements);
      
        gl.drawArrays(gl.TRIANGLES, 0, n);
    }

}