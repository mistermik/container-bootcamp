const { events, Job, Group } = require('brigadier')

events.on("push", (brigadeEvent, project) => {
    
    // setup variables
    var gitPayload = JSON.parse(brigadeEvent.payload)
    var brigConfig = new Map()
    brigConfig.set("acrServer", project.secrets.acrServer)
    brigConfig.set("acrUsername", project.secrets.acrUsername)
    brigConfig.set("acrPassword", project.secrets.acrPassword)
    brigConfig.set("webImage", "azureworkshop/rating-web")
    brigConfig.set("gitSHA", brigadeEvent.revision.commit.substr(0,7))
    brigConfig.set("eventType", brigadeEvent.type)
    brigConfig.set("branch", getBranch(gitPayload))
    brigConfig.set("imageTag", `${brigConfig.get("branch")}-${brigConfig.get("gitSHA")}`)
    brigConfig.set("webACRImage", `${brigConfig.get("acrServer")}/${brigConfig.get("webImage")}`)
    
    console.log(`==> gitHub webook (${brigConfig.get("branch")}) with commit ID ${brigConfig.get("gitSHA")}`)
    
    // setup brigade jobs
    var docker = new Job("job-runner-docker")
    var k8s = new Job("job-runner-k8s")
    dockerJobRunner(brigConfig, docker)
    kubeJobRunner(brigConfig, k8s)
    
    // start pipeline
    console.log(`==> starting pipeline for docker image: ${brigConfig.get("webACRImage")}:${brigConfig.get("imageTag")}`)
    
    
