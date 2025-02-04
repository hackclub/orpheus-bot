// Store disabled users in a Set for O(1) lookup
let disabledUsers = new Set()

try {
  // Load disabled users from file if it exists
  const fs = require('fs')
  const path = require('path')
  const filePath = path.join(__dirname, 'disabledHaikuUsers.json')
  
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8')
    disabledUsers = new Set(JSON.parse(data))
  }
} catch (err) {
  console.error('Error loading disabled haiku users:', err)
}

// Save disabled users to file
const saveDisabledUsers = () => {
  try {
    const fs = require('fs')
    const path = require('path')
    const filePath = path.join(__dirname, 'disabledHaikuUsers.json')
    fs.writeFileSync(filePath, JSON.stringify([...disabledUsers]), 'utf8')
  } catch (err) {
    console.error('Error saving disabled haiku users:', err)
  }
}

module.exports = {
  disabledUsers,
  saveDisabledUsers
} 