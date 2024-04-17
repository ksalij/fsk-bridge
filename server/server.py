from linparse import *
import random, math
from datetime import datetime
from score import calculate_score
'''
table_id to Table object
'''
running_tables = {}
game_counter = 0

def update_game_state():
    '''
    Call after most functions to send an updatated game state to the fromt-end.
    '''
    pass

class Game:

    def __init__(self, players, table_id, seed = None):
        if not seed:
            seed = int(datetime.now().timestamp())
        self.game_random = random.Random(seed)
        self.current_hand = BridgeHand(players, dealer = None, hands = {}, bids = [], play = None, contract = None, declarer = None, doubled = None, vuln = None, made = None, claimed = None)
        self.game_phase = "AUCTION"
        self.game_id = None
        self.table_id = table_id
        self.deal()
        self.set_dealer()
        self.current_player = self.current_hand.dealer

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
        
    def new_game(self, North = None, East = None, South = None, West = None):
        
        '''
        Get a new game id.
        Create player global game_counter dictionary.
        Set the dealer and vulnerability.
        '''
                
    def begin_play_phase(self):
        self.game_phase = "PLAY"

    def update_current_player(self):
        ''' 
        Check that the card is in the players hand.
        Make sure it is the players turn.
        See if it is the opening lead, if so make sure the right player is leading.
        If the trick has been started, check that the person is following suit.
        Add the card they played to the play dictionary. 
        Remove that card from their hand. 
        Update game state.
        '''
        # Check if the game is over
        if len(self.current_hand.play) == 13 and len(self.current_hand.play[-1]) == 5:
            self.current_player = None
            # Tell front end that game is over
            return
        
        # Check if this is the opening lead
        if len(self.current_hand.play) == 0:
            self.current_player = self.get_left_player(self.current_hand.declarer)
            return

        # check if a trick is in progress
        if len(self.current_hand.play[-1]) < 5:
            self.current_player = self.get_left_player(self.current_player)
            return
        
        # if we are starting a new trick, see who won the last trick
        last_trick = self.current_hand.play[-1]
        trick = {}
        trick['N'] = last_trick['N']
        trick['E'] = last_trick['E']
        trick['S'] = last_trick['S']
        trick['W'] = last_trick['W']
        self.current_player = get_trick_winner(trick, last_trick['lead'], trump=self.current_hand.contract[1])
        return

    def get_left_player(self, player):
        return PLAYERS[PLAYER_MAP[player] + 1 % 4]

    def play_card(self, player: str, card: Card):
        '''
        input:
            player: str (direction)
            card: Card 
        '''
        # check if the card is in the players hand
        if not card in self.current_hand.hands[player]:
            return False


    def make_bid(self, player, bid):
        '''
        Check if the bid is valid.
        If so, update the BridgeHand auction state.
        Return all valid bids for the next player.
        '''
        pass

    def end_game(self):
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
    
    def get_score(self, vulerable, contract, result):
        pass
        # return calculate_score(contract[0][0], contract[0][1], contract[1], result)


class Table:
    '''
    Stores information about tables of players.

    players: dict (keys: positions)
    seed: int
    '''
    def __init__(self, players: dict, seed: int = None):
        self.players = players
        self.seed = seed
        self.game_count = 0
        self.NS_score = 0
        self.EW_score = 0
        self.current_game = None
        self.game_id_list = []
        self.table_id = math.trunc(int(datetime.now().timestamp()))

    def new_game(self):
        game_id = self.game_id = math.trunc(int(datetime.now().timestamp()))
        self.game_id_list.append(game_id)
        self.current_game = Game(self.players, game_id, seed = self.seed)
    
    def join_table(self):
        pass

    def update_score(self):
        pass

if __name__=="__main__": 
    # pass
    # my_game = Game(["1", "2", "3", "4"], 0)
    bridge_hand = parse_linfile("example.lin")
    print(bridge_hand.players)
    print(bridge_hand.play)
    print(bridge_hand.hands)
    # my_game.get_score(bridge_hand.vuln, bridge_hand.contract, bridge_hand.made)