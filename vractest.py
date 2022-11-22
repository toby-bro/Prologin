L = list(range(12))
print(L)
for i in L:
    print(i)
    if i%2 == 0:
        L.remove(i)
    print(i)
    
L = [1, 2, 3, 4, 5, 6, 7, 1, 2, 5, 8, 9, 10, 1, 5]
L.sort()
print(L)

def test(a,b,c):
    if a == b:
        print(4)
        return
    else:
        print(c)

test(1,1,3)