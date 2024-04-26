from server import *
from linparse import *

def play_full_hand():
    players = {'E': 'user0', 'S': 'user1', 'W': 'user2', 'N': 'user3'}
    
    table = Table(players, seed = 0)
    table.new_game()
    table.current_game.current_bridgehand.contract = '2S'
    table.current_game.current_bridgehand.declarer = 'N'
    table.current_game.current_bridgehand.doubled = 0
    
    table.current_game.begin_play_phase()

    for i in range(52):
        # table.current_game.update_current_player()
        print("current_player", table.current_game.current_player)
        print("Hand", table.current_game.current_bridgehand.hands[table.current_game.current_player])
        print("playable cards", table.current_game.get_playable_cards())
        print("Play", table.current_game.current_bridgehand.play)
        for j in range(len(table.current_game.current_bridgehand.hands[table.current_game.current_player].cards)):
            if table.current_game.play_card(table.current_game.current_player, table.current_game.current_bridgehand.hands[table.current_game.current_player][j]):
                break
    

def test_lin_file():
    bridge_hand = parse_linfile("example.lin")
    print(bridge_hand.players)
    print(bridge_hand.play)
    print(bridge_hand.hands)

def test_auction():
    players = {'E': 'user0', 'S': 'user1', 'W': 'user2', 'N': 'user3'}
    
    table = Table(players, seed = 0)
    table.new_game()
    table.current_game.make_bid('E', '2C')


if __name__=="__main__": 
    play_full_hand()
    # test_auction()