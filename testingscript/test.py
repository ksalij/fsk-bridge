from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
import subprocess
import os.path
import time
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

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
    print(driver.current_url)
    table_id = driver.current_url.split('/')[-1]
    print(table_id)
    return table_id

def joinTable(username, password, table_id, driver):
    driver.switch_to.new_window('tab')
    login(username, password, driver)

    table_id_field = driver.find_element(By.ID, "id")
    table_id_field.send_keys(table_id)

    table_id_field.send_keys(Keys.RETURN)
    
    time.sleep(0.5)

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
table_id = newTable("a", "a", driver)
print("table_id = " + table_id)
for letter in ["b", "c", "d"]:
    joinTable(letter, letter, table_id, driver)
driver.switch_to.new_window('tab')
driver.close()