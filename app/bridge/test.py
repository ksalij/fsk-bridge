from server import *
from linparse import *
# from linwrite import *

def play_full_hand():
    players = {'E': 'user0', 'S': 'user1', 'W': 'user2', 'N': 'user3'}
    
    table = Table(players, seed = 0)
    table.new_game()
    table.current_game.current_bridgehand.contract = '2S'
    table.current_game.current_bridgehand.declarer = 'N'
    table.current_game.current_bridgehand.doubled = 0
    
    table.current_game.begin_play_phase()

    for i in range(51):
        # table.current_game.update_current_player()
        print("current_player", table.current_game.current_player)
        print("Hand", table.current_game.current_bridgehand.hands[table.current_game.current_player])
        print("playable cards", table.current_game.get_playable_cards())
        print("Play", table.current_game.current_bridgehand.play)
        for j in range(len(table.current_game.current_bridgehand.hands[table.current_game.current_player].cards)):
            if table.current_game.play_card(table.current_game.current_player, table.current_game.current_bridgehand.hands[table.current_game.current_player][j]):
                break
    

def test_lin_file():
    bridge_hand = parse_linfile("../lin/example.lin")
    print(bridge_hand.players)
    print(bridge_hand.play)
    print(bridge_hand.hands)

def test_auction():
    players = {'E': 'user0', 'S': 'user1', 'W': 'user2', 'N': 'user3'}
    
    table = Table(players, seed = 0)
    table.new_game()
    print("starting player", table.current_game.current_player)
    print("valid bids", table.current_game.valid_bids)
    print("auction", table.current_game.current_bridgehand.bids)
    table.current_game.make_bid('N', '2C')
    print("valid bids", table.current_game.valid_bids)
    print("auction", table.current_game.current_bridgehand.bids)
    table.current_game.make_bid('E', 'd')
    print("valid bids", table.current_game.valid_bids)
    print("auction", table.current_game.current_bridgehand.bids)
    table.current_game.make_bid('S', 'r')
    print("valid bids", table.current_game.valid_bids)
    print("auction", table.current_game.current_bridgehand.bids)
    table.current_game.make_bid('W', 'p')
    print("valid bids", table.current_game.valid_bids)
    print("auction", table.current_game.current_bridgehand.bids)
    table.current_game.make_bid('N', 'p')
    print("valid bids", table.current_game.valid_bids)
    print("auction", table.current_game.current_bridgehand.bids)
    table.current_game.make_bid('E', 'p')
    print("valid bids", table.current_game.valid_bids)
    print("auction", table.current_game.current_bridgehand.bids)

    print(table.current_game.current_bridgehand.declarer)
    print(table.current_game.game_phase)
    print(table.current_game.current_player)

def auction_then_play():
    players = {'E': 'user0', 'S': 'user1', 'W': 'user2', 'N': 'user3'}
    table = Table(players, seed = 0)
    table.new_game()

    print(table.current_game.get_json("user1"))
    print()

    table.current_game.make_bid('N', '2C')
    table.current_game.make_bid('E', 'd')

    print(table.current_game.get_json("user1"))
    print()
    
    table.current_game.make_bid('S', 'r')
    table.current_game.make_bid('W', 'p')
    table.current_game.make_bid('N', 'p')
    table.current_game.make_bid('E', 'p')

    for i in range(26):
        for j in range(len(table.current_game.current_bridgehand.hands[table.current_game.current_player].cards)):
            if table.current_game.play_card(table.current_game.current_player, table.current_game.current_bridgehand.hands[table.current_game.current_player][j]):
                break

    print(table.current_game.get_json("user1"))

def play_2_boards_lin():
    players = {'E': 'user0', 'S': 'user1', 'W': 'user2', 'N': 'user3'}
    table = Table(players, seed = 0)
    table.new_game()
    table.current_game.make_bid('N', '2C')
    table.current_game.make_bid('E', 'd')
    table.current_game.make_bid('S', 'r')
    table.current_game.make_bid('W', 'p')
    table.current_game.make_bid('N', 'p')
    table.current_game.make_bid('E', 'p')

    for i in range(52):
        for j in range(len(table.current_game.current_bridgehand.hands[table.current_game.current_player].cards)):
            if table.current_game.play_card(table.current_game.current_player, table.current_game.current_bridgehand.hands[table.current_game.current_player][j]):
                break
    
    table.new_game()
    table.current_game.make_bid('E', '1H')
    table.current_game.make_bid('S', 'p')
    table.current_game.make_bid('W', '1S')
    table.current_game.make_bid('N', 'p')
    table.current_game.make_bid('E', '1N')
    table.current_game.make_bid('S', 'p')
    table.current_game.make_bid('W', 'p')
    table.current_game.make_bid('N', 'p')

    for i in range(52):
        for j in range(len(table.current_game.current_bridgehand.hands[table.current_game.current_player].cards)):
            if table.current_game.play_card(table.current_game.current_player, table.current_game.current_bridgehand.hands[table.current_game.current_player][j]):
                break

if __name__=="__main__": 
    # play_full_hand()
    # test_auction()
    # test_lin_file()
    auction_then_play()
    # play_2_boards_lin()