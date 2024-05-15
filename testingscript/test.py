from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
import subprocess
import os.path
import time
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.action_chains import ActionChains

def login(username, password, driver):
    driver.get("http://localhost/")
    driver.find_element(By.ID, "logout").click()
    usernameField = driver.find_element(By.ID, "username")
    passwordField = driver.find_element(By.ID, "password")
    usernameField.clear()
    usernameField.send_keys(username)
    passwordField.clear()
    passwordField.send_keys(password)
    passwordField.send_keys(Keys.RETURN)

def newTable(username, password, driver):
    login(username, password, driver)
    newTable = driver.find_element(By.ID, "newtable")
    newTable.click()
    table_id = driver.current_url.split('/')[-1]
    readyUpButton = driver.find_element(By.ID, "ready-button")
    readyUpButton.click()
    handle = driver.current_window_handle
    return table_id, handle

def joinTable(username, password, table_id, driver):
    driver.switch_to.new_window('tab')
    login(username, password, driver)

    table_id_field = driver.find_element(By.ID, "id")
    table_id_field.send_keys(table_id)

    table_id_field.send_keys(Keys.RETURN)
    readyUpButton = driver.find_element(By.ID, "ready-button")
    readyUpButton.click()
    handle = driver.current_window_handle
    return handle
def playRandomCard(handle):
    driver.switch_to.window(handle)
    cards = driver.find_elements(By.ID, "playable_card")
    print("cards: ")
    print(cards)
    # for card in cards:
    #     print("card src: " + card.get_attribute("src"))
    #     try:
    #         card.click()
    #     except:
    #         pass
    if cards:
        print("card src: " + cards[0].get_attribute("src"))
        ac = ActionChains(driver)
        ac.move_to_element(cards[0]).move_by_offset(-25, 0).click().perform()
        ac.move_by_offset(50, 0).click().perform()

def makeBid(bid, handle):
    driver.switch_to.window(handle)
    bidbuttons = driver.find_elements(By.ID, bid)
    print("bidbuttons: ")
    print(bidbuttons)
    for bidbutton in bidbuttons:
        try:
            bidbutton.click()
        except:
            pass

# subprocess.run(["docker", "compose", "build"])
# subprocess.run(["docker", "compose", "up"])
chrome_options = Options()
chrome_options.add_argument("--no-sandbox")
homedir = os.path.expanduser("~")
chrome_options.binary_location = f"{homedir}/chrome-linux64/chrome"
chrome_options.add_experimental_option("detach", True)
webdriver_service = Service(f"{homedir}/chromedriver-linux64/chromedriver")
print("script running")
driver = webdriver.Chrome(service=webdriver_service, options=chrome_options)
print("driver started")
handles = []
table_id, handle = newTable("a", "a", driver)
handles.append(handle)
print("table_id = " + table_id)
for letter in ["b", "c", "d"]:
    handle = joinTable(letter, letter, table_id, driver)
    handles.append(handle)

for handle in handles:
    makeBid("C", handle)
for _ in range(4):
    for handle in handles:
        makeBid("p", handle)

for i in range(52):
    for handle in handles:
        playRandomCard(handle)

driver.switch_to.new_window('tab')
driver.close()