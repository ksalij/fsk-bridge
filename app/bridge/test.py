from bridge.server import *

def play_full_hand():
    players = {'E': 'user0', 'S': 'user1', 'W': 'user2', 'N': 'user3'}
    
    table = Table(players, seed = 0)
    table.new_game()
    table.current_game.current_bridgehand.contract = '2S'
    table.current_game.current_bridgehand.declarer = 'N'
    table.current_game.current_bridgehand.doubled = 0
    
    table.current_game.begin_play_phase()

    for i in range(52):
        table.current_game.update_current_player()
        print("current_player", table.current_game.current_player)
        print("cards", table.current_game.current_bridgehand.hands[table.current_game.current_player])
        for j in range(len(table.current_game.current_bridgehand.hands[table.current_game.current_player].cards)):
            if table.current_game.play_card(table.current_game.current_player, table.current_game.current_bridgehand.hands[table.current_game.current_player][j]):
                break
        print(table.current_game.current_bridgehand.play)
    print("tricks played", len(table.current_game.current_bridgehand.play))
    print("Tricks made", table.current_game.current_bridgehand.made)
    print("Final Score", table.current_game.get_score())

if __name__=="__main__": 
    play_full_hand()
