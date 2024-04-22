from linparse import *
import random
from datetime import datetime
from score import calculate_score
'''
table_id to Table object
'''
running_tables = {}
game_counter = 0



class Game:

    def __init__(self, players, seed = None):
        if not seed:
            seed = int(datetime.now().timestamp())
        self.game_random = random.Random(seed)
        self.current_hand = BridgeHand(players, dealer = None, hands = {}, bids = [], play = None, contract = None, declarer = None, doubled = None, vuln = None, made = None, claimed = None)
        self.game_phase = "AUCTION"
        self.id = None

        self.deal()
        self.set_dealer()

    def deal(self):
        full_hand = full_hand()
        self.game_random.shuffle(full_hand.cards)
        N_hand = full_hand.cards[0:13]
        E_hand = full_hand.cards[13:26]
        S_hand = full_hand.cards[26:39]
        W_hand = full_hand.cards[39:52]

        self.current_hand.hands = {
            'N': N_hand,
            'E': E_hand,
            'S': S_hand,
            'W': W_hand
        }
        
    def new_game(North = None, East = None, South = None, West = None):
        '''
        Get a new game id.
        Create plaglobal game_counteryer dictionary.
        Set the dealer and vulnerability.
        '''
                

    def play_card():
        pass

    def make_bid(player, bid):
        '''
        Check if the bid is valid.
        If so, update the BridgeHand auction state.
        Return all valid bids for the next player.
        '''
        pass

    def end_game():
        '''
        Distroy stored game state.
        Calculate and output score.
        '''
        pass

    def set_dealer(self, table_id):
        '''
        Get who the dealer should be based on how many hands have been played so far.
        '''
        players = ['N', 'E', 'S', 'W']
        self.current_hand.dealer = players[running_tables[table_id].game_count % 4]

    def get_vulnerability(self, table_id):
        '''
        Get the vulnerability for the current board.
        '''
        vulnerabilities = ['none', 'NS', 'EW', 'both',
                           'NS', 'EW', 'both', 'none',
                           'EW', 'both', 'none', 'NS',
                           'both', 'none', 'NS', 'EW']
        self.current_hand.vuln = vulnerabilities[running_tables[table_id].game_count % 16]
    
    def get_score(vulerable, contract, result):
        return calculate_score(contract[0][0], contract[0][1], contract[1], result)


class Table:
    '''
    Stores information about tables of players.

    players: dict (keys: positions)
    seed: int
    '''
    def __init__(self, players, seed = None):
        self.players = players
        self.seed = seed
        self.game_count = 0
        self.NS_score = 0
        self.EW_score = 0
        self.current_game = None
        self.game_id_list = []
        self.new_game()

    def new_game(self):
        if self.seed:
            gameSeed = self.seed.pop(0)
        game = Game(self.players, gameSeed)
        pass
    
    def join_table(self):
        pass

    def update_score(self):
        pass

if __name__=="__main__": 
    pass
    my_game = Game()
    # my_game.deal()
    # print(parse_linfile("example.lin").bids)