const IpfsAPI = require('ipfs-api')
const OrbitDB = require('orbit-db')
const ipfs = new IpfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})
const orbitdb = new OrbitDB(ipfs)

let persons
let musicGroups
let musicReleases

const testDBPutsAndGets = () => {
    // test person
    putPerson(person1)
        .then(() => putPerson(person2))
        .then(() => console.log("all users", getPersons()))
        .then(() => console.log("all users sorted by name", getPersons({sortBy: "name"})))
        .then(() => console.log("second user", getPerson("2")))

    // test music group
    putMusicGroup(musicGroup1)
        .then(() => putMusicGroup(musicGroup2))
        .then(() => console.log("all groups", getMusicGroups()))
        .then(() => console.log("all groups sorted by name", getMusicGroups({sortBy: "name"})))
        .then(() => console.log("second group", getMusicGroup("2")))

    // test music release
    putMusicRelease(musicRelease1)
        .then(() => putMusicRelease(musicRelease2))
        .then(() => console.log("all releases", getMusicReleases()))
        .then(() => console.log("all releases sorted by name", getMusicReleases({sortBy: "name"})))
        .then(() => console.log("all releases by artist 1", getMusicReleases({artistId: "1"})))
        .then(() => console.log("second release", getMusicRelease("1")))
}

const testDB = async () => {
    persons = await orbitdb.docstore('persons', { indexBy: 'id', replicate: false })
    musicGroups = await orbitdb.docstore('musicGroups', { indexBy: 'id', replicate: false })
    musicReleases = await orbitdb.docstore('musicReleases', { indexBy: 'id', replicate: false })
    console.log("DB setup")

    testDBPutsAndGets()
}

testDB()

// person methods
const putPerson = async (person) => {
    const hash = await persons.put(person)
    return await ipfs.pin.add(hash)
}

const getPerson = (id) => {
    return persons.get(id)
}

const getPersons = (opts) => {
    let personsDoc = persons.query((doc) => !!doc.id)

    if (opts && opts.sortBy) {
        personsDoc = personsDoc.sort(function(a, b){
            return compare(a, b, opts.sortBy)
        })
    }

    return personsDoc
}

// music group methods
const putMusicGroup = async (musicGroup) => {
    const hash = await musicGroups.put(musicGroup)
    return await ipfs.pin.add(hash)
}

const getMusicGroup = (id) => {
    return musicGroups.get(id)
}

const getMusicGroups = (opts) => {
    let musicGroupsDoc = musicGroups.query((doc) => !!doc.id)
    
    if (opts && opts.sortBy) {
        musicGroupsDoc = musicGroupsDoc.sort(function(a, b){
            return compare(a, b, opts.sortBy)
        })
    }

    return musicGroupsDoc
}

// music release methods
const putMusicRelease = async (getMusicRelease) => {
    const hash = await musicReleases.put(getMusicRelease)
    return await ipfs.pin.add(hash)
}

const getMusicRelease = (id) => {
    return musicReleases.get(id)
}

const getMusicReleases = (opts) => {
    let MusicReleasesDoc

    if (opts && opts.artistId) {
        MusicReleasesDoc = musicReleases.query((doc) => doc.artistId == opts.artistId)
    } else {
        MusicReleasesDoc = musicReleases.query((doc) => !!doc.id)
    }
    
    if (opts && opts.sortBy) {
        MusicReleasesDoc.sort(function(a, b){
            return compare(a, b, opts.sortBy)
        })
    }

    for (let doc of MusicReleasesDoc) {
        doc.artist = getMusicGroup(doc.artistId)
    }

    return MusicReleasesDoc
}

const compare = (a, b, prop) => {
    if (a[prop] < b[prop])
        return -1;
    else
        return 1;
}

let person1 = {
    id: "1",
    name: 'Diane Cluck',
    description: "folk artist from california"
}

let person2 = {
    id: "2",
    name: 'Alela Diane',
    description: "anti-folk artist from NY"
}

let musicGroup1 = {
    id: "1",
    name: "Mountain Man",
    description: "anti group",
    member: ["1"]
}

let musicGroup2 = {
    id: "2",
    name: "Actors",
    description: "anti-folk group",
    member: ["2"]
}

let musicRelease1 = {
    id: "1",
    name: "Cats and Boats",
    description: "a release about cats",
    artistId: "1"
}

let musicRelease2 = {
    id: "2",
    name: "Boats and Cats",
    description: "a release about boats",
    artistId: "1"
}
