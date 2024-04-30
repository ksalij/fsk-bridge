from linparse import *
from server import *

DEALER_MAP = {'S':1, 'W':2, 'N':3, 'E':4}

def linwrite(table: Table):
    bridge_hand = table.current_game.current_bridgehand
    output = ''
    output += 'pn|' + bridge_hand.players['S'] + ',' + bridge_hand.players['W'] + ',' + bridge_hand.players['N'] + ',' + bridge_hand.players['E'] + '|st||md|'
    output += str(DEALER_MAP[bridge_hand.dealer])
    # hands
    # print(bridge_hand.hands['S'].sort())
    # for card in bridge_hand.hands['S'].sort():
    #     output += card.suitname + card.rankname
    vuln = {'NS': 'n','WE': 'e','none': 'o', 'both': 'b'}
    output += '|rh||ah|Board ' + str(len(table.game_id_list)) + '|sv|' + vuln[bridge_hand.vuln] + '|mb|'
    return output

if __name__== "__main__":
    bridge_hand = parse_linfile("../lin/example.lin")
    table = Table(bridge_hand.players)
    table.new_game()
    table.current_game.current_bridgehand = bridge_hand
    print(linwrite(table))
    