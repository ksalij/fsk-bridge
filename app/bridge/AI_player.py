'''
File to convert bridgeHand objects to be read into a neural network for play.
'''


from bridge.linparse import *
from tensorflow import keras
import numpy as np
import tensorflow as tf
import pandas as pd
import sys

SUIT_VALUES = {"C": 0, "D": 1, "H": 2, "S": 3, "N": 4}
PLAYERS = {0:'E', 1:'S', 2:'W', 3:'N'}
PLAYER_MAP = {'E':0, 'S': 1, 'W': 2, 'N': 3}
PARTNER = {'N': 'S', 'S': 'N', 'E': 'W', 'W': 'E'}
SUITS = {0:'C', 1:'D', 2:'H', 3:'S'}
REV_CARDMAP = {2:'2', 3:'3', 4:'4', 5:'5', 6:'6', 7:'7', 8:'8', 9:'9', 10:'T', 11:'J', 12:'Q', 13:'K', 14:'A'}

# 4(dealer) + 4(player position) + 52(player hand) + 35(auction N) + 35(auction S) + 35(auction E) + 35(auction W) +  4(dummy position) + 52(Dummy Hand) + 884(tricks)
def vectorize(bridge_hand, AI_player):
    '''Create a bit-vector for a play neural net input from a bridgeHand object'''
    dealer = vectorize_pos(bridge_hand.dealer)
    player_pos = vectorize_pos(AI_player)
    player_hand = vectorize_hand(bridge_hand.hands[AI_player])
    dummy = PARTNER[bridge_hand.declarer]
    dummy_pos = vectorize_pos(dummy)
    dummy_hand = vectorize_hand(bridge_hand.hands[dummy])
    auction = vectorize_auction(bridge_hand.bids, bridge_hand.dealer)
    tricks = vectorize_tricks(bridge_hand.play, 4*(len(bridge_hand.play) - 1) + len(bridge_hand.play[-1]) - 1, AI_player)
    return dealer + player_pos + player_hand + auction + dummy_pos + dummy_hand + tricks

def vectorize_pos(pos):
    d = ["0"] * 4
    d[PLAYER_MAP[pos]] = "1"
    return d

def vectorize_tricks(play, cards_played, current_player):
    # 208(played cards) + 156(current trick)
    partner_map = {"N": "S", "S": "N", "W":"E", "E":"W"}
    opp_map = {"N": "EW", "S":"EW", "E":"NS", "W":"NS"}
    prev_tricks = {"N": ["0"] * 52, "E": ["0"] * 52, "S": ["0"] * 52,"W": ["0"] * 52}
    current_trick = ["0"] * 52 * 3
    tricks_played = cards_played // 4
    current_trick_num = cards_played % 4
    for i in range(tricks_played):
        leader = play[i]['lead']
        for j in range(4):
            player = PLAYERS[(PLAYER_MAP[leader] + j) % 4]
            card = play[i][player]
            prev_tricks[player][card.suit * 13 + card.rank - 2] = "1"
    for i in range(current_trick_num):
        leader = play[tricks_played]['lead']
        player = PLAYERS[(PLAYER_MAP[leader] + i) % 4]
        card = play[tricks_played][player]
        current_trick[(52 * i) + (card.suit * 13) + (card.rank - 2)] = "1"
    return prev_tricks[current_player] + prev_tricks[partner_map[current_player]] + prev_tricks[opp_map[current_player][0]] + prev_tricks[opp_map[current_player][1]] + current_trick

def vectorize_auction(bids, dealer):
    auction_N = ["0"] * 35
    auction_S = ["0"] * 35
    auction_E = ["0"] * 35
    auction_W = ["0"] * 35
    for i in range(len(bids)):
        bid = bids[i]
        if not (bid == 'p' or bid == 'd' or bid == 'r'):
            bid = list(bid)
            index = (int(bid[0]) - 1) * 5 + SUIT_VALUES[bid[1]]
            if dealer == 'N':
                if i % 4 == 0:
                    auction_N[index] = "1"
                elif i % 4 == 1:
                    auction_E[index] = "1"
                elif i % 4 == 2:
                    auction_S[index] = "1"
                elif i % 4 == 3:
                    auction_W[index] = "1" 
            elif dealer == 'E':
                if i % 4 == 0:
                    auction_E[index] = "1"
                elif i % 4 == 1:
                    auction_S[index] = "1"
                elif i % 4 == 2:
                    auction_W[index] = "1"
                elif i % 4 == 3:
                    auction_N[index] = "1" 
            elif dealer == 'S':
                if i % 4 == 0:
                    auction_S[index] = "1"
                elif i % 4 == 1:
                    auction_W[index] = "1"
                elif i % 4 == 2:
                    auction_N[index] = "1"
                elif i % 4 == 3:
                    auction_E[index] = "1" 
            elif dealer == 'W':
                if i % 4 == 0:
                    auction_W[index] = "1"
                elif i % 4 == 1:
                    auction_N[index] = "1"
                elif i % 4 == 2:
                    auction_E[index] = "1"
                elif i % 4 == 3:
                    auction_S[index] = "1"
    return auction_N + auction_S + auction_E + auction_W

def vectorize_hand(hand):
    hand_vector = ["0"] * 52

    for card in hand:
        hand_vector[card.suit * 13 + card.rank - 2] = "1"
    
    return hand_vector