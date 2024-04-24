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
    '''
        
    '''

    def __init__(self, players: dict, table_id: int, seed: int = None):
        if seed == None:
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
        total_hand = full_hand()
        self.game_random.shuffle(total_hand.cards)
        N_hand = Hand(total_hand.cards[0:13]).sort()
        E_hand = Hand(total_hand.cards[13:26]).sort()
        S_hand = Hand(total_hand.cards[26:39]).sort()
        W_hand = Hand(total_hand.cards[39:52]).sort()

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
        self.current_hand.play = []

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
        return PLAYERS[(PLAYER_MAP[player] + 1) % 4]

    def play_card(self, player: str, card: Card):
        '''
        input:
            player: str (direction)
            card: Card 
        output:
            returns True of card is successfully played, False otherwise
        '''
        # check if the card is in the players hand
        if not self.current_hand.hands[player].has(card):
            return False
        if not player == self.current_player:
            return False

        # start a new trick
        if len(self.current_hand.play) == 0 or len(self.current_hand.play[-1] == 5):
            self.current_hand.hands[player].pop_card(self.current_hand.hands[player].cards.index(card))
            new_trick = {}
            new_trick['lead'] = player
            new_trick[player] = card
            self.current_hand.play.append(new_trick)
            return True
        
        lead_suit = self.current_hand.play[-1]['lead'][1]
        if self.hand_contains_suit(self.current_hand.hands[player], lead_suit):
            if not card[1] == lead_suit:
                return False
            
        self.current_hand.hands[player].pop_card(self.current_hand.hands[player].index(card))
        
        # add to most recent trick
        self.current_hand.play[-1][player] = card
        return True

    def hand_contains_suit(self, hand: Hand, suit: str):
        contains = False
        for card in hand.cards:
            if card.suitname == suit:
                contains = True
                break
                
        return contains

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

    def set_dealer(self):
        '''
        Get who the dealer should be based on how many hands have been played so far.
        '''
        players = ['N', 'E', 'S', 'W']
        self.current_hand.dealer = players[running_tables[self.table_id].game_count % 4]

    def get_vulnerability(self, table_id):
        '''
        Get the vulnerability for the current board.
        '''
        vulnerabilities = ['none', 'NS', 'EW', 'both',
                           'NS', 'EW', 'both', 'none',
                           'EW', 'both', 'none', 'NS',
                           'both', 'none', 'NS', 'EW']
        self.current_hand.vuln = vulnerabilities[running_tables[table_id].game_count % 16]
    
    def get_score(self):
        level = self.current_hand.contract[0][0]
        suit = self.current_hand.contract[0][1]
        doubled = self.current_hand.contract[1]
        result = self.current_hand.made
        return calculate_score(level, suit, doubled, result)


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
        running_tables[self.table_id] = self

    def new_game(self):
        game_id = self.game_id = math.trunc(int(datetime.now().timestamp()))
        self.game_id_list.append(game_id)
        self.current_game = Game(self.players, game_id, seed = self.seed)
    
    def join_table(self, player, ):
        pass

    def update_score(self):
        pass

if __name__=="__main__": 
    # pass
    # my_game = Game(["1", "2", "3", "4"], 0)
    # bridge_hand = parse_linfile("example.lin")
    # print(bridge_hand.players)
    # print(bridge_hand.play)
    # print(bridge_hand.hands)
    # my_game.get_score(bridge_hand.vuln, bridge_hand.contract, bridge_hand.made)
    players = {'E': 'user0', 'S': 'user1', 'W': 'user2', 'N': 'user3'}
    
    table = Table(players, seed = 0)
    table.new_game()
    table.current_game.current_hand.contract = '2S'
    table.current_game.current_hand.declarer = 'N'
    table.current_game.begin_play_phase()
    print(table.current_game.current_hand.players)
    print(table.current_game.current_hand.play)
    print(table.current_game.current_hand.hands)
    table.current_game.update_current_player()
    print("current player", table.current_game.current_player)

    print(table.current_game.current_hand.hands['E'][0])
    table.current_game.play_card('E', table.current_game.current_hand.hands['E'][0])
    print(table.current_game.current_hand.hands)
    print(table.current_game.current_hand.play)

    table.current_game.update_current_player()
    print("current player", table.current_game.current_player)

