window.addEventListener('DOMContentLoaded', function(){
    var canvas = document.getElementById('renderCanvas');
    var engine = new BABYLON.Engine(canvas, true);

    var createScene = function(){
        var scene = new BABYLON.Scene(engine);

        // Skybox
        var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:1000.0}, scene);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("https://www.babylonjs-playground.com/textures/skybox", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skybox.material = skyboxMaterial;

        // Create a camera
        var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.attachControl(canvas, true);

        // Player Weapon
        BABYLON.SceneLoader.ImportMesh("", "https://assets.babylonjs.com/meshes/", "HVGirl.glb", scene, function (meshes) {
            var weapon = meshes[0];
            weapon.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
            weapon.parent = camera;
            weapon.position = new BABYLON.Vector3(0.5, -0.5, 1);
            weapon.rotation.y = Math.PI;
        });

        // Create a light
        var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
        light.intensity = 0.7;

        // Create a ground
        var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 100, height: 100}, scene);
        var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture("https://www.babylonjs-playground.com/textures/grass.png", scene);
        ground.material = groundMaterial;

        // Add trees
        BABYLON.SceneLoader.ImportMesh("", "https://www.babylonjs-playground.com/scenes/Tree/", "tree.obj", scene, function (newMeshes) {
            var tree = newMeshes[0];
            tree.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);

            for (var i = 0; i < 20; i++) {
                var newTree = tree.clone("tree" + i);
                var x = Math.random() * 80 - 40;
                var z = Math.random() * 80 - 40;
                newTree.position = new BABYLON.Vector3(x, 0, z);
            }
            tree.isVisible = false; // Hide the original tree
        });

        // Monkey Enemies
        var monkeys = [];
        var monkeyCount = 5;

        BABYLON.SceneLoader.ImportMesh("", "https://assets.babylonjs.com/meshes/", "monkey.glb", scene, function (meshes) {
            var monkeyMesh = meshes[0];
            monkeyMesh.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
            monkeyMesh.isVisible = false;

            for (var i = 0; i < monkeyCount; i++) {
                var newMonkey = monkeyMesh.clone("monkey" + i);
                newMonkey.isVisible = true;
                var x = Math.random() * 80 - 40;
                var z = Math.random() * 80 - 40;
                newMonkey.position = new BABYLON.Vector3(x, 1, z);
                monkeys.push(newMonkey);
            }
        });

        // Simple AI for monkeys
        scene.onBeforeRenderObservable.add(function () {
            for (var i = 0; i < monkeys.length; i++) {
                var monkey = monkeys[i];
                if (monkey.isDisposed()) continue; // Skip if monkey is already disposed
                var direction = camera.position.subtract(monkey.position).normalize();
                monkey.position.addInPlace(direction.scale(0.1)); // Move towards player
            }
        });

        // Shooting Mechanics
        scene.onPointerObservable.add(function (pointerInfo) {
            if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
                var pickResult = scene.pick(scene.pointerX, scene.pointerY);
                if (pickResult.hit && pickResult.pickedMesh.name.startsWith("monkey")) {
                    pickResult.pickedMesh.dispose(); // Remove the monkey
                    monkeysRemaining--;
                    hudText.text = "Monkeys: " + monkeysRemaining;

                    if (monkeysRemaining === 0) {
                        var winText = new BABYLON.GUI.TextBlock();
                        winText.text = "You Win!";
                        winText.color = "gold";
                        winText.fontSize = 60;
                        advancedTexture.addControl(winText);
                    }
                    // TODO: Add visual feedback for hit (particles, sound)
                }
                // TODO: Add muzzle flash visual feedback
            }
        }, BABYLON.PointerEventTypes.POINTERDOWN);

        // UI
        var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        var hudText = new BABYLON.GUI.TextBlock();
        hudText.text = "Monkeys: " + monkeys.length;
        hudText.color = "white";
        hudText.fontSize = 24;
        hudText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        hudText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        hudText.paddingLeft = "10px";
        hudText.paddingTop = "10px";
        advancedTexture.addControl(hudText);

        var monkeysRemaining = monkeys.length;

        return scene;
    }

    var scene = createScene();

    engine.runRenderLoop(function(){
        scene.render();
    });

    window.addEventListener('resize', function(){
        engine.resize();
    });
});
