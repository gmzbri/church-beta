$(document).ready(function () {
  // Scene, camera, and renderer setup
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const helper = new THREE.CameraHelper(camera);
  scene.add(helper);

  camera.position.z = 3;
  var renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    precision: "highp"
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("sphere-container").appendChild(renderer.domElement);

  // Sphere creation
  var sphere = new THREE.Mesh(
    new THREE.SphereGeometry(8, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.4,
      wireframe: true
    })
  );

  scene.add(sphere);

  var count = 0; // Global counter for points

  // Modified getRandomPointOnSphere function
  function getRandomPointOnSphere(radius) {
    var u = Math.random(); // Random number between 0 and 1
    var v = Math.random(); // Random number between 0 and 1

    // Expand the range of u and v values for a larger area
    u = u * 0.8 + 0.2; // Map to the range [0.2, 0.8]
    v = v * 0.4 + 0.2; // Map to the range [0.2, 0.8]

    var theta = 2 * Math.PI * u; // Azimuthal angle (around the y-axis)

    // Bias the polar angle (phi) towards the top (upper hemisphere)
    var phiBias = Math.PI * 0.25; // You can adjust the bias angle as needed
    var phi = Math.acos(2 * v - 1) + phiBias; // Polar angle (from top to bottom)

    // Convert spherical coordinates to Cartesian coordinates
    var x = radius * Math.sin(phi) * Math.cos(theta);
    var y = radius * Math.sin(phi) * Math.sin(theta);
    var z = radius * Math.cos(phi);

    // Define a minimum threshold for the absolute value of z
    var minZThreshold = radius * 0.2; // Example: 20% of the radius

    // Ensure z is not too close to the center (0)
    if (Math.abs(z) < minZThreshold) {
      z = (z >= 0 ? 1 : -1) * minZThreshold;
    }

    return new THREE.Vector3(x, y, z);
  }

  // Load images and add them as sprites
  var loader = new THREE.TextureLoader();

  var videoPaths = [
    "videos/01.mp4",
    "videos/02.mp4",
    "videos/03.mp4",
    "videos/04.mp4",
    "videos/01.mp4",
    "videos/02.mp4",
    "videos/03.mp4",
    "videos/04.mp4",
    "videos/01.mp4",
    "videos/02.mp4",
    "videos/03.mp4",
    "videos/04.mp4",
    "videos/01.mp4",
    "videos/02.mp4",
    "videos/03.mp4"
  ];

  function createVideoTexture(videoPath, callback) {
    var video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.src = videoPath;
    video.loop = true;
    video.muted = true; // Muted for autoplay without user interaction
    video.addEventListener(
      "canplaythrough",
      function () {
        video.play(); // Play the video as soon as it's ready
      },
      false
    );

    var texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;

    callback(texture);
  }

  // Rectangle creation
  var rectangleLength = (40 * Math.sqrt(2)) / 2; // The original length
  var rectangleWidth = rectangleLength / 2; // Making the width half of the length
  var rectangleGeometry = new THREE.PlaneGeometry(
    rectangleLength,
    rectangleWidth
  );

  var rectMinX = -rectangleLength / 2;
  var rectMaxX = rectangleLength / 2;
  var rectMinY = -rectangleWidth / 2;
  var rectMaxY = rectangleWidth / 2;
  var rectZ = -8; // Z position of the rectangle

  // Define the number of rows and columns for the grid
  var gridRows = 3; // Example: 3 rows
  var gridCols = 5; // Example: 5 columns

  // Calculate cell size
  var cellWidth = rectangleLength / gridCols;
  var cellHeight = rectangleWidth / gridRows;

  // Keep track of used grid cells
  var usedCells = [];

  videoPaths.forEach(function (videoPath, index) {
    createVideoTexture(videoPath, function (texture) {
      var aspectRatio = 16 / 9; // Default aspect ratio, adjust as needed

      // Randomly select a width of 3 or 4
      var planeWidth = Math.random() < 0.5 ? 4 : 5;
      var planeHeight = planeWidth / aspectRatio;

      var material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide
      });
      var plane = new THREE.Mesh(
        new THREE.PlaneGeometry(planeWidth, planeHeight),
        material
      );

      // Get a random position on the sphere
      var randomPosition = getRandomPointOnSphere(8); // Assuming the sphere radius is 8

      // Create a yellow square with new height and color
      var squareHeight = 0.2; // New height in pixels
      var pixelsPerUnit = 1; // Adjust this based on your scene's scale
      var squareGeometry = new THREE.PlaneGeometry(
        planeWidth,
        squareHeight / pixelsPerUnit
      );
      var squareMaterial = new THREE.MeshBasicMaterial({ color: 0xf2f732 }); // New color

      var square = new THREE.Mesh(squareGeometry, squareMaterial);

      // Position the square just below the video plane
      square.position.set(
        0,
        -planeHeight / 2 - squareHeight / (2 * pixelsPerUnit),
        0
      );

      // Attach the square to the plane
      plane.add(square);

      // Create text and add to each plane
      var fontLoader = new THREE.FontLoader();

      fontLoader.load("fonts/SuperstudioTrial-Bold.json", function (font) {
        var textGeometry = new THREE.TextGeometry("ROSALIA  Tuya", {
          font: font,
          size: 2,
          height: 0
        });

        var textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 }); // Adjust color as needed
        var textMesh = new THREE.Mesh(textGeometry, textMaterial);

        // Scale down the text mesh
        textMesh.scale.set(0.05, 0.05, 0.05); // Scale it down to the desired size

        // Position the text mesh
        textMesh.position.set(
          -planeWidth / 2 + 0.05,
          -planeHeight / 2 - squareHeight / 1.4,
          0.01
        ); // Adjust position as needed
        plane.add(textMesh); // Add the text mesh to the plane
      });

      // Add a scaling factor to adjust the distance of the image from the sphere's center
      var scalingFactor = 1 + (Math.random() - 0.5) * 0.8; // Random factor between 0.9 and 1.1
      randomPosition.multiplyScalar(scalingFactor);

      //plane.position.set(randomPosition.x, randomPosition.y, randomPosition.z);
      // Generate a random position within the bounds of the rectangle
      var randomX = Math.random() * (rectMaxX - rectMinX) + rectMinX;
      var randomY = Math.random() * (rectMaxY - rectMinY) + rectMinY;

      // Randomly select a grid cell that has not been used
      var cell;
      do {
        cell = {
          row: Math.floor(Math.random() * gridRows),
          col: Math.floor(Math.random() * gridCols)
        };
      } while (usedCells.some((usedCell) => usedCell.row === cell.row && usedCell.col === cell.col));
      usedCells.push(cell);

      // Calculate the position within the selected grid cell
      var cellX = rectMinX + cell.col * cellWidth + Math.random() * cellWidth;
      var cellY = rectMinY + cell.row * cellHeight + Math.random() * cellHeight;

      plane.position.set(cellX, cellY, randomPosition.z);

      plane.lookAt(new THREE.Vector3(0, 0, 0)); // Adjust orientation

      scene.add(plane);
    });
  });

  // Mouse Move Event Listener
  window.addEventListener("mousemove", onMouseMove, false);

  var rotationX = 0;
  var rotationY = 0;

  var centerRotation = { x: 0, y: 0 }; // Central rotation values
  var centerThreshold = 0.1; // Threshold for center detection (10% of screen width/height)

  var targetRotation = { x: 0, y: 0 };

  function onMouseMove(event) {
    var mouseX = 0.5 - event.clientX / window.innerWidth;
    var mouseY = 0.5 - event.clientY / window.innerHeight;

    // Define limits for rotation
    var maxRotationAngle = Math.PI * 0.16; // 18% of PI

    // Calculate rotation, clamping it within the desired range
    // The rotation is now limited to ±20% of a full rotation in each direction
    rotationX = Math.max(
      -maxRotationAngle,
      Math.min(maxRotationAngle, mouseY * 2 * maxRotationAngle)
    );
    rotationY = Math.max(
      -maxRotationAngle,
      Math.min(maxRotationAngle, mouseX * 2 * maxRotationAngle)
    );

    // Set targetRotation directly based on mouse movement
    targetRotation = { x: rotationX, y: rotationY };

    // New rotation for the logo element
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const deltaX = event.clientX - centerX;
    const deltaY = centerY - event.clientY;

    const logoRotationX = deltaY / 20; // Adjust sensitivity as needed
    const logoRotationY = deltaX / 20; // Adjust sensitivity as needed

    // Apply the rotation to the logo element
    const logoElement = document.querySelector(".logo");
    if (logoElement) {
      logoElement.style.transform = `translate(-50%,-50%) perspective(700px) rotateX(${logoRotationX}deg) rotateY(${logoRotationY}deg)`;
    }
  }

  // Render function remains the same
  function render() {
    requestAnimationFrame(render);

    // Update video textures
    scene.traverse(function (object) {
      if (object.isMesh) {
        var material = object.material;
        if (material.map && material.map.isVideoTexture) {
          material.map.needsUpdate = true;
        }
      }
    });

    camera.rotation.y += (targetRotation.y - camera.rotation.y) * 0.02;
    camera.rotation.x += (targetRotation.x - camera.rotation.x) * 0.02;
    renderer.render(scene, camera);
  }
  render();

  // Resize event
  $(window).resize(function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Initial visibility settings
  helper.visible = false;
  sphere.material.wireframe = false;

  // Toggle button click event
  $("#toggleHelper").click(function () {
    helper.visible = !helper.visible; // Toggle visibility of camera helper
    sphere.material.wireframe = !sphere.material.wireframe; // Toggle wireframe visibility

    // Update button text based on visibility state
    if (helper.visible) {
      $(this).text("Hide helper");
    } else {
      $(this).text("Show helper");
    }
  });
});
