from linparse import *
from server import *

DEALER_MAP = {'S':1, 'W':2, 'N':3, 'E':4}
SUITS = {0:'C', 1:'D', 2:'H', 3:'S'}
RANK_NAMES = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A']

def linwrite(table: Table):
    bridge_hand = table.current_game.current_bridgehand
    output = ''
    output += 'pn|' + bridge_hand.players['S'] + ',' + bridge_hand.players['W'] + ',' + bridge_hand.players['N'] + ',' + bridge_hand.players['E'] + '|st||md|'
    output += str(DEALER_MAP[bridge_hand.dealer])

    for dir in bridge_hand.hands:
        if dir == 'E':
            break
        cards_str = 'S' + ''.join(RANK_NAMES[card.rank-2] for card in bridge_hand.hands[dir] if card.suitname == 'S') + \
                    'H' + ''.join(RANK_NAMES[card.rank-2] for card in bridge_hand.hands[dir] if card.suitname == 'H') + \
                    'D' + ''.join(RANK_NAMES[card.rank-2] for card in bridge_hand.hands[dir] if card.suitname == 'D') + \
                    'C' + ''.join(RANK_NAMES[card.rank-2] for card in bridge_hand.hands[dir] if card.suitname == 'C')
        output += cards_str + ','

    vuln = {'NS': 'n','WE': 'e','none': 'o', 'both': 'b'}
    output += '|rh||ah|Board ' + str(table.game_count) + '|sv|' + vuln[bridge_hand.vuln]
    for bid in bridge_hand.bids:
        output += '|mb'
        output += '|' + bid
    for trick in bridge_hand.play:
        player = trick['lead']
        output += '|pg|'
        for i in range(4):
            output += '|pc'
            card = trick[PLAYERS[(PLAYER_MAP[player] + i) % 4]]
            card_num = card.rankname
            if card_num == '10':
                card_num = 'T'
            suit = card.suitname
            output += '|' + suit + card_num
    output += '|pg||'

    return output

if __name__== "__main__":
    with open("../lin/example.lin", 'r') as f:
        lin=f.read()
        print(lin)
    bridge_hand = parse_linfile("../lin/example.lin")
    table = Table(bridge_hand.players)
    table.game_count = 5
    table.new_game()
    table.current_game.current_bridgehand = bridge_hand
    print()
    print(linwrite(table))
    