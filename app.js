   
// Set global fetch header
const options = {
    method: 'GET',
    headers: {
        'X-RapidAPI-Key': 'ea555ca7c7msh3a2e8a467d42e11p17d60ejsn6c230cb05a9b',
        'X-RapidAPI-Host': 'api-nba-v1.p.rapidapi.com'
    }
}

// Set global variables
let nbaTeams =[{}]
let nbaSeasons = []
let nbaPlayers = []
let selectedTeam = {
    season: null,
    team: null
}
let selectedPlayer = {
    player: null,
    season: null,
    averages: null,
    cost: null
}
let starting5 = {
    guards: [],
    forwards: [],
    center: null,
    numGuards: 0,
    numForwards: 0,
    numCenters: 0,
    cost: 0,
    priceLimit: 25
}

// Create Player Class
class Player{
    constructor(id, fullName, position, number, school, season, logo){
        this.id = id
        this.fullName = fullName
        this.position = position
        this.number = number
        this.school = school
        this.season = season
        this.logo = logo
    }
}

// Call initial fetch
fetchData('teams')

// Fetch all initial data
async function fetchData(endPoint){
    let url = 'https://api-nba-v1.p.rapidapi.com/'
    let res = {}
    let data = {}
    
    // execute next steps based on endPoint
    switch (endPoint) {
        case 'teams':
            url = url + endPoint
            try {
                res = await fetch(url, options)
                data = await res.json()
                // console.log(data)
                createNBATeams(data)
            }
            catch(err) {
                console.log(err)
            }
        break
        case 'seasons':
            url = url + endPoint
            try {
                res = await fetch(url, options)
                data = await res.json()
                // console.log(data)
                createNBASeasons(data)
            }
            catch(err) {
                console.log(err)
            }
        break
        case 'players':

            // for each season and team (required API parameters), create an object and call createNBAPlayers
            playersURL = `${url}${endPoint}?team=${selectedTeam.team.id}&season=${selectedTeam.season}`
            // console.log(playersURL)
            try {
                res = await fetch(playersURL, options)
                data = await res.json()
                // console.log(data)
                createNBAPlayersTable(data)
            }
            catch(err) {
                console.log(err)
            }
        break
        case 'stats':
            statsURL = `${url}players/statistics?id=${selectedPlayer.player.id}&season=${selectedPlayer.season}`
            console.log(statsURL)
            try {
                res = await fetch(statsURL, options)
                data = await res.json()
                // console.log(data)
                return data
            }
            catch(err) {
                console.log(err)
            }
        break
    }
}

// Create NBA Teams object
function createNBATeams(teams){
    
    // Load only NBA teams
    class Team{
        constructor(id, city, code, nickName, fullName, logo){
            this.id = id
            this.city = city
            this.code = code
            this.nickName = nickName
            this.fullName = fullName
            this.logo = logo
        }
    }

    // iterate through all teams to create NBA Teams object
    let x = 0
    for (let i=0; i < teams.results; i++){
        if (teams.response[i].nbaFranchise && !teams.response[i].allStar){
            nbaTeams[x] = new Team(
                teams.response[i].id,
                teams.response[i].city,
                teams.response[i].code,
                teams.response[i].nickname,
                teams.response[i].name,
                teams.response[i].logo)
            x++
        }
    }
    
    // after NBA Teams are created, fetch seasons
    fetchData('seasons')

    // Create NBA Teams selection options
    createNBATeamsPicklist(nbaTeams)
}

// Create NBA Seasons Array
function createNBASeasons(seasons){
    for (let i=0; i < seasons.results; i++){
        nbaSeasons = seasons.response
    }
    // console.log(nbaSeasons)

    // after NBA Seasons are created, fetch players
    createNBASeasonsPicklist(nbaSeasons)
}

// Create NBA Seasons selection options
function createNBASeasonsPicklist(seasons){
    let seasonPicklist = document.getElementById('season-picklist')
    seasonPicklist.addEventListener('change', handleSeasonSelection)

    // Create HMTL options
    for (let i=0; i < seasons.length; i++){
        let newOption = document.createElement('option')
        let newSeasonText = document.createTextNode(seasons[i])
        newOption.appendChild(newSeasonText)
        seasonPicklist.appendChild(newOption)
    }
}

// Create NBA Teams selection options
function createNBATeamsPicklist(teams){
    let teamPicklist = document.getElementById('team-picklist')
    teamPicklist.addEventListener('change', handleTeamSelection)
    
    // Create HMTL options
    for (let i=0; i < teams.length; i++){
        let newOption = document.createElement('option')
        let newTeamText = document.createTextNode(teams[i].fullName)
        newOption.appendChild(newTeamText)
        newOption.setAttribute('teamid', teams[i].id)
        teamPicklist.appendChild(newOption)
    }
}

// Handle team selection from picklist
function handleTeamSelection(){

    // Set selectedTeam values
    let teamPicklist = document.getElementById('team-picklist')
    let id = teamPicklist.options[teamPicklist.selectedIndex].getAttribute('teamid')
    selectedTeam.team = nbaTeams.find(team => team.id == id)

    // Get player data if selectedTeam values are set
    if (selectedTeam.team !== null && selectedTeam.season !== null){
        fetchData('players')
    }
}

// Handle season selection from picklist
function handleSeasonSelection(){

    // Set selectedTeam values
    let seasonPicklist = document.getElementById('season-picklist')
    selectedTeam.season = seasonPicklist.options[seasonPicklist.selectedIndex].text

    // Get player data if selectedTeam values are set
    if (selectedTeam.team !== null && selectedTeam.season !== null){
        fetchData('players')
    }

    // console.log(`Selected value: ${seasonPicklist.options[seasonPicklist.selectedIndex].text}`)
}


// Create NBA Players Table
function createNBAPlayersTable(players){
    
    // Get table HTML
    let playersTableHTML = document.getElementById('players-table')
    
    // Clear and create table headings
    playersTableHTML.innerHTML = ''
    let playersTableHead = document.createElement('thead')
    let playersTableHeadingsHTML = document.createElement('tr')
    playersTableHeadingsHTML.setAttribute('id', 'players-table-headings')
    playersTableHead.appendChild(playersTableHeadingsHTML)
    playersTableHTML.appendChild(playersTableHead)
    
    // Create table columsn array
    let playersTableColumns = ['Name', 'Position', 'Number', 'School']

    // Create players table headings
    for (let i=0; i < playersTableColumns.length; i++){
        let newTH = document.createElement('th')
        let newTHText = document.createTextNode(playersTableColumns[i])
        newTH.appendChild(newTHText)
        playersTableHeadingsHTML.appendChild(newTH)
    }
    
    // Create new players object
    nbaPlayers = createNBAPlayers(players)

    // Create Player Row
    for (let i=0; i < nbaPlayers.length; i++){          
        
        // Create HTML elements for the player row
        let newTR = document.createElement('tr')
        let nameTD = document.createElement('td')
        let positionTD = document.createElement('td')
        let numberTD = document.createElement('td')
        let schoolTD = document.createElement('td')

        // Set TD text values
        let nameText = document.createTextNode(nbaPlayers[i].fullName)
        let positionText = document.createTextNode(nbaPlayers[i].position)
        let numberText = document.createTextNode(nbaPlayers[i].number)
        let schoolText = document.createTextNode(nbaPlayers[i].school)

        // Append TDs to new row
        nameTD.appendChild(nameText)
        newTR.appendChild(nameTD)
        positionTD.appendChild(positionText)
        newTR.appendChild(positionTD)
        numberTD.appendChild(numberText)
        newTR.appendChild(numberTD)
        schoolTD.appendChild(schoolText)
        newTR.appendChild(schoolTD)

        let tableBody = document.createElement('tbody')

        newTR.setAttribute('player-id', nbaPlayers[i].id)
        newTR.addEventListener('click', handlePlayerSelection)

        tableBody.appendChild(newTR)
        playersTableHTML.appendChild(tableBody)
    }
}

// Create list of NBA players from selected season and team
function createNBAPlayers(players){
    
    let nbaPlayers = []

    // Loop through players and create new Player using Player class
    let x = 0
    for (let i=0; i < players.results; i++){
        if (players.response[i].leagues.hasOwnProperty('standard') && players.response[i].leagues.standard.pos !== null){
            nbaPlayers[x] = new Player(
                players.response[i].id,
                `${players.response[i].firstname} ${players.response[i].lastname}`,
                players.response[i].leagues.standard.pos,
                players.response[i].leagues.standard.jersey,
                players.response[i].college,
                selectedTeam.season,
                selectedTeam.logo
            )
            x++
        }
    }
    return nbaPlayers
}

// Handle Player Click
async function handlePlayerSelection(Event){
    
    // Show popup
    let popupHTML = document.getElementById('popup')
    popupHTML.classList.remove('hidden')

    // Get close popUp
    let popupCloseHTML = document.querySelector('.closePopUp')
    popupCloseHTML.addEventListener('click', closePopUp)

    // Get add to team button
    let addButtonHTML = document.getElementById('add-to-team')
    addButtonHTML.addEventListener('click', handleAddToTeam)

    // Clear popup
    let popupContainerHTML = document.querySelector('.popup-container')
    popupContainerHTML.innerHTML = ''

    // Set selected player values
    let id = +Event.target.parentElement.attributes['player-id'].value
    selectedPlayer.season = selectedTeam.season
    selectedPlayer.player = nbaPlayers.find(player => player.id == id)

    // Fetch player statistics
    let playerStats = await fetchData('stats')
    getSeasonAverages(playerStats)

    // Create popup of selected player
    let newH1 = document.createElement('h1')
    let h1Text = document.createTextNode(`${selectedPlayer.player.fullName}, ${selectedPlayer.player.position}`)
    let newH3 = document.createElement('h3')
    let h3Text = document.createTextNode(`Price: $${selectedPlayer.cost}`)
    
    newH1.appendChild(h1Text)
    newH3.appendChild(h3Text)
    newH1.appendChild(newH3)
    popupContainerHTML.appendChild(newH1)

    addButtonHTML.classList.remove('hidden')

    // Add Starting 5 to popup
    let starting5 = document.getElementById('starting-5')
    popupHTML.appendChild(starting5)

}

// Caluclate Season Averages for player
function getSeasonAverages(stats){

    let points = []
    let rebs = []
    let assists = []
    let blks = []
    let steals = []

    for (let i=0; i < stats.results; i++){
        points[i] = stats.response[i].points
        rebs[i] = stats.response[i].totReb
        assists[i] = stats.response[i].assists
        blks[i] = stats.response[i].blocks
        steals[i] = stats.response[i].steals
    }

    // Call average function
    let averages = {}
    averages.points = calculateAverage(points)
    averages.rebs = calculateAverage(rebs)
    averages.assists = calculateAverage(assists)
    averages.blks = calculateAverage(blks)
    averages.steals = calculateAverage(steals)

    selectedPlayer.averages = averages

    calculateCost(selectedPlayer)
}

// Average calculator function
function calculateAverage(arr){
    let total = 0
    for (let i=0; i < arr.length; i++){
        total += arr[i]
    }
    // console.log(total)
    let avg = Math.round((total/arr.length) * 10)/10
    return (avg)
}

// Calculate player cost
function calculateCost(player){
    let averages = player.averages
    let averagesArr = [averages.points, averages.rebs, averages.steals, averages.blks, averages.assists]
    let totalAverage = Math.round(calculateAverage(averagesArr))
    selectedPlayer.cost = totalAverage
}

// Function to close popup
function closePopUp(){
    let popupHTML = document.getElementById('popup')
    popupHTML.classList.add('hidden')

    let addButtonHTML = document.getElementById('add-to-team')
    addButtonHTML.classList.add('hidden')

    let starting5 = document.getElementById('starting-5')
    document.body.appendChild(starting5)
}

// Handle Add to Team button click
function handleAddToTeam(){
    console.log(selectedPlayer)
    console.log(starting5)

    // Add cost to starting 5
    starting5.cost = starting5.cost + selectedPlayer.cost
    
    if (starting5.priceLimit < starting5.cost){
        console.log(`Before cost: ${starting5.cost}`)
        window.alert('Buddy,,, you out of money!!')
        starting5.cost = starting5.cost - selectedPlayer.cost
        console.log(`After cost: ${starting5.cost}`)
        return
    }

    // Get Starters HTML elements
    let guard1 = document.getElementById('starting-guard-1')
    let guard2 = document.getElementById('starting-guard-2')
    let forward1 = document.getElementById('starting-forward-1')
    let forward2 = document.getElementById('starting-forward-1')
    let center = document.getElementById('starting-center')
    
    // Handle Guard Selection
    if (selectedPlayer.player.position.includes('G') && starting5.numGuards < 2){
        console.log('Creating a new guard')

        if (starting5.numGuards === 1){
            console.log('Creating a second guard')
            starting5.guards[1] = selectedPlayer.player
            starting5.numGuards++
            
            createStarterCard(starting5.guards[1], guard2)
            closePopUp()
        } else if (starting5.numGuards === 0){
            console.log('creating a first guard')
            starting5.guards[0] = selectedPlayer.player
            starting5.numGuards++

            createStarterCard(starting5.guards[0], guard1)
            closePopUp()
        }
        return
    } else if (selectedPlayer.player.position.includes('G') && !selectedPlayer.player.position.includes('F') && starting5.numGuards === 2){
        window.alert('You already have 2 guards')
        starting5.cost = starting5.cost - selectedPlayer.cost
        return
    }

    // Handle Forward Selection
    if (selectedPlayer.player.position.includes('F') && starting5.numForwards < 2){
        console.log('Creating a new forward')
        if (starting5.numForwards === 1){
            console.log('Creating a second forward')
            starting5.forwards[1] = selectedPlayer.player
            starting5.numForwards++

            createStarterCard(starting5.forwards[1], forward2)
            closePopUp()
        } else if (starting5.numForwards === 0){
            console.log('creating a first forward')
            starting5.forwards[0] = selectedPlayer.player
            starting5.numForwards++

            createStarterCard(starting5.forwards[0], forward1)
            closePopUp()
        }
        return
    } else if (selectedPlayer.player.position.includes('F') && !selectedPlayer.player.position.includes('C') && starting5.numForwards === 2){
        window.alert('You already have 2 forwards')
        starting5.cost = starting5.cost - selectedPlayer.cost
        return
    }

    // Handle Center Selection
    if (selectedPlayer.player.position.includes('C') && starting5.numCenters === 0){
        console.log('Creating the center')
        starting5.center = selectedPlayer.player
        starting5.numCenters++

        createStarterCard(starting5.center, center)
        closePopUp()
        return
    } else if (selectedPlayer.player.position.includes('C') && starting5.numCenters === 1){
        window.alert('You already have a center')
        starting5.cost = starting5.cost - selectedPlayer.cost
        return
    }

}

// Create Starter Card
function createStarterCard(player, card){

    // Clear card
    card.innerHTML = ''
    let starting5HTML = document.getElementById('starting-5')

    // Player Name and Year
    let h3 = document.createElement('h3')
    let h3Text = document.createTextNode(`${player.season} ${player.fullName}`)
    h3.appendChild(h3Text)

    let h4 = document.createElement('h4')
    let h4Text = document.createTextNode(`${player.position}, $${selectedPlayer.cost}`)
    h4.appendChild(h4Text)

    // Player logo
    let logo = document.createElement('img')
    logo.setAttribute('src', selectedTeam.team.logo)

    card.appendChild(h3)
    card.appendChild(h4)
    card.appendChild(logo)
    console.log(card)
    starting5HTML.append(card)
    document.body.appendChild(starting5HTML)


    // Update funds
    let moneyContainer = document.getElementById('money-container')
    let money = document.getElementById('money')
    money.innerHTML = ''
    moneyContainer.innerHTML = ''

    console.log(starting5.numCenters + starting5.numForwards + starting5.numGuards)

    if ((starting5.numCenters + starting5.numForwards + starting5.numGuards) === 5){
        let moneyText = document.createTextNode(`What a good lookin' Starting 5!! You even have $${starting5.priceLimit - starting5.cost} leftover, a team-building savant.`)
        money.appendChild(moneyText)
        moneyContainer.appendChild(money)
    } else {
        let moneyText = document.createTextNode(`You have $${starting5.priceLimit - starting5.cost} to spend, spend it wisely.`)
        money.appendChild(moneyText)
        moneyContainer.appendChild(money)
    }
    

}